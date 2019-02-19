import groovy.transform.Field

// Version Info
String currentVersion
String nextVersion
String semanticVersion

// Configuration properties
@Field def configData
@Field String teamEmail
@Field String slackRoomName
@Field String slackCredentials

// How many days before we expire a build or un-deploy a dev stage?
@Field final int timeoutDays = 1

// Project Name - this value is set by the name of the Jenkins job which should also be the name of the repo
@Field final String projectName
@Field final String nodeVersion = "v8.11"

String commit_id
Map deploymentOutput
boolean isMasterBranch = env.BRANCH_NAME == "master"
//AWS

stage("Build")
{
    node("linux")
    {
        stage("Choose semantic version") {
            semanticVersion = input(id: 'userInput', message: "Please select the semantic version of build...",
                    parameters: [[$class: 'ChoiceParameterDefinition', choices: 'patch\nminor\nmajor', name: "choices"]])
        }
        node("linux") {
            try {
                projectName = env.JOB_NAME.substring(0, env.JOB_NAME.indexOf('/'))
                bitbucketStatusNotify(buildState: "INPROGRESS")
                // Make sure we have a clean workspace before we get started
                cleanUpWorkspace()
                withCredentials([[$class: "UsernamePasswordMultiBinding", credentialsId: "e0860691-2bc8-45eb-900a-a5583dad5747", usernameVariable: "GIT_USERNAME", passwordVariable: "GIT_PASSWORD"]]) {
                    sh "git clone https://${env.GIT_USERNAME}:${env.GIT_PASSWORD}@bitbucket.org/iSystemsTeam/${projectName}.git"
                }
                dir(projectName) {
                    sh "git checkout ${env.BRANCH_NAME}"

                    configData = readJSON file: './jenkins.config.json'
                    teamEmail = configData.teamEmail
                    slackRoomName = configData.slackRoomName
                    slackCredentials = configData.slackCredentials

                    sh "git checkout -b temp-${env.BRANCH_NAME}"

                    nvm(nodeVersion) {
                        sh "npm install"
                        installServiceApiDependencies()
                        sh "npm test"
                    }

                    // Bump the build version
                    currentVersion = getVersion()
                    sh "npm --no-git-tag-version version ${semanticVersion}"
                    nextVersion = getVersion()
                }
            }
            catch (Exception e) {
                cleanUpWorkspace()
                // Notify build breaking culprit and team of regressions on critical branches
                if (isMasterBranch) {
                    notifyTeam(e)
                }

                bitbucketStatusNotify(buildState: "FAILED")
                throw e
            }
        }
    }
    node ("linux") {

        stage("deploy - development") {
            deployStage("development")
            runIntegrationTests("development")
        }
        stage("deploy - staging") {
            deployStage("staging")
            runIntegrationTests("staging")
        }

        if (isMasterBranch) {
            stage("Deploy to Production") {
                deploymentNotification("${projectName}: ready to deploy version: ${nextVersion} to production.", teamEmail, false)
                deployStage("production")
                node("linux") {
                    dir(projectName) {
                        sh "git add package.json package-lock.json CHANGELOG.md"
                        sh "git commit -m 'version bump to ${nextVersion}'"

                        sh "git checkout ${env.BRANCH_NAME}" // This should always be 'master'
                        sh "git merge temp-${env.BRANCH_NAME}" // This should always be 'temp-master'
                        //Get commit id:
                        commit_id = sh(
                                script: "git rev-parse --short HEAD",
                                returnStdout: true
                        ).trim()

                        sh "git tag -m \"Built by Jenkins\" -a ${nextVersion} ${commit_id}"
                        sh "git push origin ${env.BRANCH_NAME} ${nextVersion}"
                    }
                    deploymentNotification("${projectName}: successfully deployed version: ${nextVersion} to production!", teamEmail, true)
                }
                runIntegrationTests("production") 
            }
        }
    }
}

// handle all notifications of failure
void notifyTeam(Exception ex) {
    echo "Failure Notification"
    echo "${ex}"
    sendSlackMessage(slackCredentials, slackRoomName, "Failing build: ${env.BUILD_URL}: ${ex}", "#e01716")
    emailext body: "Failing build: ${env.BUILD_URL}: ${ex}",
            recipientProviders: [[$class: "DevelopersRecipientProvider"], [$class: "CulpritsRecipientProvider"]],
            subject: "Broken Build Alert! - ${env.JOB_NAME}",
            to: "${teamEmail}"

}

void deploymentNotification(String message, String teamEmail, Boolean sendEmail) {
    sendSlackMessage(slackCredentials, slackRoomName, message, "#2eb886")
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

void sendSlackMessage(String creds, String room, String message, String color) {
    slackSend channel: room,
            color: color,
            message: ":mojo-jojo: ${message}",
            tokenCredentialId: creds
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
    dir(projectName) {
        sh "ls -lah"
        String awsCredentialsId = configData.awsConfig["${environment}"].credentialsId
        deployInternalServices(awsCredentialsId, environment)
        deployService('services/api/direct-deposits', awsCredentialsId, environment)      
    }
}

void deployInternalServices(String awsCredentialsId, String environment) {
    dir('services/internal-api') {
         nvm(nodeVersion) {
            runWithAwsCredentials(awsCredentialsId, "node --max-old-space-size=2048 node_modules/.bin/serverless deploy --variables ${environment}.serverless.variables.json")
        }
    }
}


void deployService(String directory, String awsCredentialsId, String environment) {
    dir(directory) {
         nvm(nodeVersion) {
            runWithAwsCredentials(awsCredentialsId, "node_modules/.bin/serverless create_domain --variables ${environment}.serverless.variables.json")
            runWithAwsCredentials(awsCredentialsId, "node --max-old-space-size=2048 node_modules/.bin/serverless deploy --variables ${environment}.serverless.variables.json")
        }
    }
}

void installServiceApiDependencies() {
    dir('services/internal-api') {
        sh 'npm install'
    }

    dir('services/api/direct-deposits') {
        sh 'npm install'
    }
}

void runIntegrationTests(String environment) {
    node("linux") {
        dir(projectName) {
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
}


void deployStage(String environment) {
    timeout(time: timeoutDays, unit: "DAYS") {
        def userInput = input(id: "userInput", message: "Promote to ${environment}")
    }

    node("linux") {
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
}

void cleanUpWorkspace() {
    dir(projectName) {
        sh "sudo rm -rf *"
        deleteDir()
    }
}