"use strict"

const fs = require("fs")
const path = require("path")
const process = require("process")
const core = require("@actions/core")
const exec = require("@actions/exec")

const toBoolean = (str) => {
    if (str === true || str === 1) return true
    const lower = typeof (str) === "string" ? str.toLowerCase() : ""
    if (lower === "true") return true
    if (!str || lower === "false") return false
    throw new Error(`Your whimsical input "${str}" couldn't be converted to a Boolean.`)
}

const DeployToAzureStorage = async () => {
    try {
        // Defaults for these settings are defined in action.yml.
        const sourcePath = core.getInput("source-path", { required: true })
        const sasUrl = core.getInput("sas-url", { required: true })
        const cleanup = toBoolean(core.getInput("cleanup"))
        const container = core.getInput("container")
        const requireIndex = toBoolean(core.getInput("require-index"))
        const immutableExt = core.getInput("immutable") || null
        const cleanupImmutable = toBoolean(core.getInput("cleanup-immutable")) && cleanup && immutableExt

        if (requireIndex) {
            if (!fs.existsSync(path.join(sourcePath, "index.html"))) {
                core.setFailed(`The source path "${sourcePath}" doesn't contain an index.html file. It should be set to the directory containing already-built static website files.`)
                return
            }
        }

        if (immutableExt && (!immutableExt.startsWith("*") || immutableExt.indexOf(" ") >= 0)) {
            core.setFailed(`The list of immutable extensions should be in this format with no spaces: "*.js;*.css"`)
            return
        }

        const urlEndOfHost = sasUrl.indexOf("/?")
        if (urlEndOfHost < 0) {
            core.setFailed(`The SAS URL supplied (${sasUrl}) doesn't look valid. It should be a full URL with a query string. Generate one in the "Shared access signature" section of the Azure Portal.`)
            return
        }
        const urlHost = sasUrl.substring(0, urlEndOfHost + 1)
        const urlQuery = sasUrl.substring(urlEndOfHost + 2)
        const destUrl = `${urlHost}${container}?${urlQuery}`
        core.setSecret(urlQuery)

        const azCopyCommand = (process.platform === "win32") ? "azcopy" : "azcopy10"
        const commonFlags = []
        const cacheControlFlags = ["--cache-control", "public, max-age=31536000, immutable"]
        const includeFlags = immutableExt ? ["--include-pattern", immutableExt] : []
        const excludeFlags = immutableExt ? ["--exclude-pattern", immutableExt] : []
        const cleanupFlags = ["--delete-destination=true", ...(cleanupImmutable ? [] : excludeFlags)]
        let errorCode
        core.startGroup("Deploy new and updated files")
        if (immutableExt) {
            errorCode = await exec.exec(azCopyCommand, ["copy", `${sourcePath}/*`, destUrl, ...commonFlags, "--recursive", ...includeFlags, ...cacheControlFlags])
            if (errorCode) {
                core.setFailed("Deployment failed for immutable files. See log for more details.")
                return
            }
        }
        let indexData = fs.readFileSync("dist/index.html").toString('utf-8')
        fs.writeFileSync("dist/index.html", indexData.replace(/.css/g, ".css.gz").replace(/.html/g, ".html.gz").replace(/.js/g, ".js.gz"))
        await exec.exec(azCopyCommand, ["rm", `${urlHost}${container}?${urlQuery}`, "--recursive"])
        for (const file of fs.readdirSync(sourcePath)) {
            const path = sourcePath + "/" + file
            if (fs.lstatSync(path).isDirectory()) {
                for (const subFile of fs.readdirSync(path)) {
                    const subPath = path + "/" + subFile
                    core.info(subPath)
                    let contentType = ""
                    let contentEncoding = ""
                    if (subPath.includes(".html")) {
                        contentType = '--content-type=text/html'
                    } else if (subPath.includes(".css")) {
                        contentType = '--content-type=text/css'
                    } else if (subPath.includes(".js")) {
                        contentType = '--content-type=application/javascript'
                    }
                    if (subPath.includes(".br")) {
                        contentEncoding = '--content-encoding=gzip'
                    } else if (subPath.includes(".gz")) {
                        contentEncoding = '--content-encoding=gzip'
                    }

                    exec.exec(azCopyCommand, ["copy", subPath, `${urlHost}${container}/${file}/${subFile}?${urlQuery}`, contentType])
                    if (contentEncoding) {
                        exec.exec(azCopyCommand, ["copy", subPath, `${urlHost}${container}/${file}/${subFile}?${urlQuery}`, contentEncoding])
                    }
                }
            } else {
                core.info(path)
                let contentType = ""
                let contentEncoding = ""
                if (path.includes(".html")) {
                    contentType = '--content-type=text/html'
                } else if (path.includes(".css")) {
                    contentType = '--content-type=text/css'
                } else if (path.includes(".js")) {
                    contentType = '--content-type=application/javascript'
                } else if (path.includes(".ico")) {
                    contentType = '--content-type=image/vnd.microsoft.icon'
                    contentEncoding = '--content-encoding="gzip"'
                }
                if (path.includes(".br")) {
                    contentEncoding = '--content-encoding=gzip'
                } else if (path.includes(".gz")) {
                    contentEncoding = '--content-encoding=gzip'
                }
                exec.exec(azCopyCommand, ["copy", path, destUrl, contentType])
                if (contentEncoding) {
                    exec.exec(azCopyCommand, ["copy", path, destUrl, contentEncoding])
                }
            }
        }

        if (errorCode) {
            core.setFailed("Deployment failed. See log for more details.")
            return
        }
        core.endGroup()

        if (cleanup) {
            core.startGroup("Clean up obsolete files")
            errorCode = await exec.exec(azCopyCommand, ["sync", sourcePath, destUrl, ...commonFlags, ...cleanupFlags])
            if (errorCode) {
                core.setFailed("Cleanup failed. See log for more details.")
                return
            }
            core.endGroup()
        }

        core.info("")
        core.info("------------------------------------------------------------")
        core.info("Deployment was successful.")
        core.info("------------------------------------------------------------")
    }
    catch (error) {
        core.setFailed(error.message)
    }
}

DeployToAzureStorage()