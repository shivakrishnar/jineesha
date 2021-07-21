import groovy.transform.Field

// Version Info
String currentVersion
String nextVersion
String semanticVersion
@Field String skipIntegrationTests

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
@Field final String nodeVersion = "v12.14.0"

String commit_id
Map deploymentOutput
boolean isMasterBranch = env.BRANCH_NAME == "master"
//AWS

stage("Build")
{
    timeout(time: timeoutDays, unit: "DAYS") {
        stage("Choose semantic version") {
            semanticVersion = input(id: 'userInput', message: "Please select the semantic version of build...",
                    parameters: [[$class: 'ChoiceParameterDefinition', choices: 'patch\nminor\nmajor', name: "choices"]])
        }
    }
    timeout(time: timeoutDays, unit: "DAYS") {
        stage("Skip integration tests?") {
            skipIntegrationTests = input(id: 'userInput', message: "Skip integration tests?",
                    parameters: [[$class: 'ChoiceParameterDefinition', choices: 'no\nyes', name: "choices"]])
        }
    }
    node("linux") {
        try {
            projectName = env.JOB_NAME.substring(0, env.JOB_NAME.indexOf('/'))
            bitbucketStatusNotify(buildState: "INPROGRESS")
            // Make sure we have a clean workspace before we get started
            cleanUpWorkspace()
            checkout scm

            configData = readJSON file: './jenkins.config.json'
            teamEmail = configData.teamEmail
            teamsWebhookUrl = configData.teamsWebhookUrl

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

            stash name: "package", includes: "package.json"
            stash name: "package lock", includes: "package-lock.json"
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
                    commit_id = powershell (
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
            node("linux") {
                // TODO: Run integration tests in production when e-signatures is turned on for EvoNPD
                // runIntegrationTests("production") 
                sh "INTEGRATION_TEST_CONFIG_FILENAME=production.config.json node_modules/.bin/jest -c jest.integration.test.config.json -i -t direct deposit"
            }
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
    sh "ls -lah"
    String awsCredentialsId = configData.awsConfig["${environment}"].credentialsId
    deployInternalServices(awsCredentialsId, environment)
    deployService('services/api/direct-deposits', awsCredentialsId, environment)  
    deployService('services/api/sec-resource', awsCredentialsId, environment)  
    deployService('services/api/tenants', awsCredentialsId, environment)      
    deployService('services/integrations', awsCredentialsId, environment)      
}

void deployInternalServices(String awsCredentialsId, String environment) {
    dir('services/internal-api') {
         nvm(nodeVersion) {
            runWithAwsCredentials(awsCredentialsId, "node --max-old-space-size=2048 node_modules/.bin/serverless deploy --variables ${environment}")
        }
    }
    dir('services/encryption') {
         nvm(nodeVersion) {
            runWithAwsCredentials(awsCredentialsId, "./build.sh && node --max-old-space-size=2048 ../../node_modules/.bin/serverless deploy --variables ${environment}")
        }
    }
}


void deployService(String directory, String awsCredentialsId, String environment) {
    dir(directory) {
         nvm(nodeVersion) {
            runWithAwsCredentials(awsCredentialsId, "node_modules/.bin/serverless create_domain --variables ${environment}")
            runWithAwsCredentials(awsCredentialsId, "node --max-old-space-size=2048 node_modules/.bin/serverless deploy --variables ${environment}")
        }
    }
}

void installServiceApiDependencies() {
    dir('services/internal-api') {
        sh 'npm install'
    }

    dir('services/integrations') {
        sh 'npm install'
    }

    dir('services/api/direct-deposits') {
        sh 'npm install'
    }

    dir('services/api/sec-resource') {
        sh 'npm install'
    }

    dir('services/api/tenants') {
        sh 'npm install'
    }

    dir('services/encryption') {
        sh 'npm install'
    }
}

void runIntegrationTests(String environment) {
    node("linux") {
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
    sh "sudo rm -rf *"
    deleteDir()
}