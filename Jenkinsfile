import groovy.transform.Field

// Version Info
String currentVersion
String nextVersion
String semanticVersion
@Field String skipIntegrationTests
@Field boolean isReleaseBuild = false
@Field String branchBuildType
@Field String[] selectedServices
@Field String[] allServices
@Field String slsBranchNameParam = ""

// The git remote
final String gitCredentials = "ssh-bitbucket-asuresoftware"

// Configuration properties
@Field def configData
@Field String teamEmail
@Field String teamsWebhookUrl
@Field final String teamsDanger = "#ff6f60"
@Field final String teamsGood = "#4caf50"
// How many days before we expire a build or un-deploy a dev stage?
@Field final int timeoutDays = 1

// Project Name - this value is set by the name of the Jenkins job which should also be the name of the repo
@Field final String projectName
@Field final String nodeVersion = "v16.18.1"
@Field final String nodeName = "linux"

String commit_id
Map deploymentOutput
boolean isMasterBranch = env.BRANCH_NAME == "master"

// Deployment credentials
@Field final String releaseAuthorizations = "Team Mojo Jojo, Release Managers"
//AWS

stage("Build") {
    timeout(time: timeoutDays, unit: "DAYS") {
        stage("Choose semantic version") {
            semanticVersion = input(id: 'userInput', message: "Please select the semantic version of build...",
                parameters: [
                    [$class: 'ChoiceParameterDefinition', choices: 'patch\nminor\nmajor', name: "choices"]
                ])
        }
    }
    timeout(time: timeoutDays, unit: "DAYS") {
        stage("Skip integration tests?") {
            skipIntegrationTests = input(id: 'userInput', message: "Skip integration tests?",
                parameters: [
                    [$class: 'ChoiceParameterDefinition', choices: 'no\nyes', name: "choices"]
                ])
        }
    }
    if (isMasterBranch) {
        stage('Choose deployment type') {
            buildTypeResponse = input(id: 'userInput', message: 'Is this a release?',
                parameters: [
                    [$class: 'ChoiceParameterDefinition', choices: 'No\nYes', name: "choices"]
                ])
            isReleaseBuild = buildTypeResponse == 'Yes'
        }
    } else {
        stage('Choose deployment type') {
            branchBuildType = input(id: 'userInput', message: 'Choose deployment type',
                parameters: [
                    [$class: 'ChoiceParameterDefinition', choices: 'Regular build\nCreate branch build\nTear down branch build', name: "choices"]
                ])
            echo branchBuildType
        }
    }
    try {
        node(nodeName) {
            projectName = env.JOB_NAME.substring(0, env.JOB_NAME.indexOf('/'))
            bitbucketStatusNotify(buildState: "INPROGRESS")
            // Make sure we have a clean workspace before we get started
            cleanUpWorkspace()
            checkout scm

            configData = readJSON file: './jenkins.config.json'
            teamEmail = configData.teamEmail
            teamsWebhookUrl = configData.teamsWebhookUrl

            allServices = configData.services.collect { service -> return service.name }
            selectedServices = allServices // set default

            if (!isReleaseBuild) {
                timeout(time: timeoutDays, unit: "DAYS") {
                    stage("Choose services") {
                        String delimiter = ','
                        String services = input(id: 'selectedServices', message: 'Select services', parameters: [
                            extendedChoice(
                                name: 'Services',
                                multiSelectDelimiter: delimiter,
                                type: 'PT_CHECKBOX',
                                value: allServices.join(delimiter),
                                defaultValue: allServices.join(delimiter)
                            )
                        ])
                        
                        if (!services) {
                            throw new Exception('Silly Mojo, you need to choose a service to deploy!');
                        }

                        selectedServices = services.split(delimiter)
                    }
                }
            }

            sh "git checkout -b temp-${env.BRANCH_NAME}"

            nvm(nodeVersion) {
                sh "npm install"
                installServiceApiDependencies()
                sh "npm test"
            }

            if (!isMasterBranch && branchBuildType != 'Regular build') {
                slsBranchNameParam = "--branchName ${env.BRANCH_NAME}"
            }

            // Bump the build version
            currentVersion = getVersion()
            sh "npm --no-git-tag-version version ${semanticVersion}"
            nextVersion = getVersion()

            stash name: "package", includes: "package.json"
            stash name: "package lock", includes: "package-lock.json"
        }
        if (!isReleaseBuild) {
            stage('Choose the target environment') {
                environmentsList = 'development\nstaging'

                targetEnvironment = input(id: 'userInput', message: 'Please select the environment...',
                    parameters: [
                        [$class: 'ChoiceParameterDefinition', choices: environmentsList, name: "choices"]
                    ])
            }

            if (branchBuildType == 'Tear down branch build') {
                destroyService(targetEnvironment)
            } else {
                deploy(targetEnvironment)
                if (skipIntegrationTests == "no") {
                    runIntegrationTests(targetEnvironment)
                }

                if (slsBranchNameParam != "") {
                    stage("Destroy branch build?") {
                        timeout(time: timeoutDays, unit: "DAYS") {
                            input(id: "userInput", message: "Destroy branch build?")
                            destroyService(targetEnvironment)
                        }
                    }
                }
            }
        } else {
            stage("deploy - development") {
                deployStage("development")
                if (skipIntegrationTests == "no") {
                    runIntegrationTests("development")
                }
            }
            stage("deploy - staging") {
                deployStage("staging")
                if (skipIntegrationTests == "no") {
                    runIntegrationTests("staging")
                }
            }

            if (isMasterBranch) {
                stage("Deploy to Production") {
                    deploymentNotification("${projectName}: ready to deploy version: ${nextVersion} to production.", teamEmail, false)
                    deployStage("production")
                    node("EvolutionCore") {
                        ws("workspace/${env.JOB_NAME}") {
                            checkout scm
                            unstash "package"
                            unstash "package lock"

                            bat "git add package.json package-lock.json"
                            bat "git commit -m \"version bump to ${nextVersion}\""

                            //Get commit id:
                            commit_id = powershell(
                                script: "git rev-parse --short HEAD",
                                returnStdout: true,
                                returnStatus: false
                            ).trim()

                            sshagent(credentials: [gitCredentials]) {
                                bat "git tag -m \"Built by Jenkins\" -a ${nextVersion} ${commit_id}"
                                bat "git push origin ${env.BRANCH_NAME} ${nextVersion}"
                            }
                            deploymentNotification("${projectName}: successfully deployed version: ${nextVersion} to production!", teamEmail, true)

                        }
                    }
                    node(nodeName) {
                        // TODO: Run integration tests in production when e-signatures is turned on for EvoNPD
                        // runIntegrationTests("production") 
                        sh "INTEGRATION_TEST_CONFIG_FILENAME=production.config.json node_modules/.bin/jest -c jest.integration.test.config.json -i -t direct deposit"
                    }
                }
            }
        }
    } catch (Exception e) {
        node(nodeName) {
            cleanUpWorkspace()
            // Notify build breaking culprit and team of regressions on critical branches
            notifyTeam(e)

            bitbucketStatusNotify(buildState: "FAILED")
            throw e
        }
    }
}

// handle all notifications of failure
void notifyTeam(Exception ex) {
    echo "Failure Notification"
    echo "${ex}"
    sendTeamsMessage("Failing build: ${env.BUILD_URL}: ${ex}", teamsWebhookUrl, teamsDanger)
    emailext body: "Failing build: ${env.BUILD_URL}: ${ex}",
            recipientProviders: [[$class: "DevelopersRecipientProvider"], [$class: "CulpritsRecipientProvider"]],
            subject: "Broken Build Alert! - ${env.JOB_NAME}",
            to: "${teamEmail}"

}

void deploymentNotification(String message, String teamEmail, Boolean sendEmail) {
    sendTeamsMessage(message, teamsWebhookUrl, teamsGood)
    if (sendEmail) {
        emailext body: "${message}",
                recipientProviders: [
                        [$class: "DevelopersRecipientProvider"],
                        [$class: "CulpritsRecipientProvider"]
                ],
                subject: "${message}",
                to: teamEmail
    }
}

void sendTeamsMessage(String message, String webhookUrl, String color){
    office365ConnectorSend message: message, 
    webhookUrl: webhookUrl,
    color: color
}

String getVersion() {
    String packageVersion = sh(
            script: "node -p \"require('./package.json').version\"",
            returnStdout: true,
            returnStatus: false
    ).trim()

    return packageVersion
}

void runWithAwsCredentials(String awsCredentialsId, String command) {
    withCredentials([[$class: "AmazonWebServicesCredentialsBinding", credentialsId: awsCredentialsId, accessKeyVariable: "awsKey", secretKeyVariable: "awsSecret"]])
            {
                sh "export AWS_ACCESS_KEY_ID=${awsKey} && export AWS_SECRET_ACCESS_KEY=${awsSecret} && ${command} && unset AWS_ACCESS_KEY_ID && unset AWS_SECRET_ACCESS_KEY"
            }
}

void deploy(String environment) {
    node(nodeName) {
        String awsCredentialsId = configData.awsConfig["${environment}"].credentialsId

        for (String serviceName in selectedServices) {
            echo serviceName
            Object service = configData.services.find { service -> service.name == serviceName }

            deployService(service, awsCredentialsId, environment)
        }
    }
}

void deployService(
    Object service,
    String awsCredentialsId,
    String environment
) {
    dir(service.directory) {
        nvm(nodeVersion) {
            String serverlessPath = service.serverlessPath ? service.serverlessPath : 'node_modules/.bin/serverless'
            echo serverlessPath

            if (service.createDomain) {
                echo "creating domain"
                runWithAwsCredentials(awsCredentialsId, "${serverlessPath} create_domain --variables ${environment} ${slsBranchNameParam}")
            }

            if (service.preDeployCommand) {
                echo "running predeploy command"
                runWithAwsCredentials(awsCredentialsId, service.preDeployCommand)
            }

            runWithAwsCredentials(awsCredentialsId, "node --max-old-space-size=8192 ${serverlessPath} deploy --variables ${environment} ${slsBranchNameParam}")
        }
    }
}

void destroyService(String environment) {
    node(nodeName) {
        String awsCredentialsId = configData.awsConfig["${environment}"].credentialsId

        for (String serviceName in selectedServices) {
            echo serviceName
            Object service = configData.services.find { service -> service.name == serviceName }

            dir(service.directory) {
                nvm(nodeVersion) {
                    String serverlessPath = service.serverlessPath ? service.serverlessPath : 'node_modules/.bin/serverless'
                    echo serverlessPath
                    runWithAwsCredentials(awsCredentialsId, "node --max-old-space-size=8192 ${serverlessPath} remove --variables ${environment} ${slsBranchNameParam}")
                }
            }
        }
    }
}

void installServiceApiDependencies() {
    for (String serviceName in allServices) {
        echo serviceName
        Object service = configData.services.find { service -> service.name == serviceName }

        dir(service.directory) {
            sh 'npm install'
        }
    }
}

void runIntegrationTests(String environment) {
    node(nodeName) {
        String awsCredentialsId = configData.awsConfig["${environment}"].credentialsId
        try 
        {
            runWithAwsCredentials(awsCredentialsId, "INTEGRATION_TEST_CONFIG_FILENAME=${environment}.config.json npm run test:base")
        }
        catch (Exception e) {
            cleanUpWorkspace()
            notifyTeam(e)
            //Notify build breaking culprit and team of regressions on critical branches
            bitbucketStatusNotify(buildState: "FAILED")
            throw e
        }
    }
}


void deployStage(String environment) {
    timeout(time: timeoutDays, unit: "DAYS") {
        def userInput = input(id: "userInput", message: "Promote to ${environment}", submitter: (isReleaseBuild && environment == 'production') ? releaseAuthorizations : null)
    }

    try {
        deploy(environment)
    }
    catch (Exception e) {
        cleanUpWorkspace()
        notifyTeam(e)
        //Notify build breaking culprit and team of regressions on critical branches
        bitbucketStatusNotify(buildState: "FAILED")
        throw e
    }
}

void cleanUpWorkspace() {
    sh "sudo rm -rf *"
    deleteDir()
}