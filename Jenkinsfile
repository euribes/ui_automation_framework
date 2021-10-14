#!/usr/bin/env groovy
deploymentStages = [:]
map = [:]
label = "jenkins-agent-${UUID.randomUUID()}"
slackChannel = "ui-automation"

/*
 * This function reads the list of features and sends
   that list to funciton "assignFeatureToMachine"
 */
def getFeaturesGroupsToRun() {
    def numMachines = "${CONTAINERS}".toInteger()
    def list = sh(script: "find cypress/integration/ -name '*.js' -print0 | xargs -0 | tr  ' ' ,", returnStdout: true)
    def map = assignFeatureToMachine(numMachines, list)

    print 'Number of containers: ' + numMachines
    map.each { key, value -> 
        print 'Size: ' + value.size() + ' '   + key + ' ' + value
    }
    return map
}

/*
 * This function gets the list of features and assign each one
   to a machine to be executed
 */
def assignFeatureToMachine(numMachines, list) {
    def map = [:]
    def round = 0
    def nameAndValue = list.split(',')
    print 'Number of feature files ' + nameAndValue.size()

    nameAndValue.eachWithIndex { val, idx ->
        round = (idx / numMachines).toInteger()
        if (idx < numMachines) {
            map['machine' + idx] = []
            map['machine' + idx].add(val)
        } else {
            map['machine' + (idx-(numMachines*round))].add(val)
        }
    }
    return map.toSorted()
}

pipeline {
    agent {
        docker {
            image "cypress/included:8.6.0"
            args "--entrypoint='' -u 0:0"
        }
    }
    stages{
        stage('Set up environment') {
            steps {
                sleep(5)
                sh 'npm i'
            }
        }
        stage('Cypress execution') {
            steps {
                script {
                    def map = getFeaturesGroupsToRun()
                    map.each{
                        key, value -> deploymentStages["${key}"] = {
                            stage("Stage ${key}") {
                                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                                    def featureList = map[key].join(",")
                                    credentials = readFile(file: "${CREDENTIALS}")
                                    lines = credentials.readLines()
                                    def AUTOMATION_USER = lines[0]
                                    def PASSWORD = lines[1]
                                    def PASSPHRASE = lines[2]
                                    def API_URL = lines[3]
                                    def ACCESS_TOKEN = lines[4]
                                    def REFRESH_TOKEN = lines[5]
                                    def CLIENT_ID = lines[6]
                                    def CLIENT_SECRET = lines[7]
                                    wrap([$class: "MaskPasswordsBuildWrapper",
                                        varPasswordPairs: [
                                            [password: AUTOMATION_USER],
                                            [password: PASSWORD],
                                            [password: PASSPHRASE],
                                            [password: API_URL],
                                            [password: ACCESS_TOKEN],
                                            [password: REFRESH_TOKEN],
                                            [password: CLIENT_ID],
                                            [password: CLIENT_SECRET]
                                        ]]) {
                                        timeout(time: 260) {
                                            sh "XDG_CONFIG_HOME=/tmp/cyhome-${key} npx cypress run -e '${USERNAME},${PASSWORD} --browser ${BROWSER} --config video=${VIDEO},numTestsKeptInMemory=0,videoCompression=51 --spec ${featureList}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                    parallel deploymentStages
                }
            }
        }
        stage('Reporting') {
            steps {
                sh "rm -rf allure-commandline-*"
                sh "rm -rf allure-2.13.9"
                sh "apt install default-jre allure -y"
                sh "wget -P /tmp/ https://repo1.maven.org/maven2/io/qameta/allure/allure-commandline/2.13.9/allure-commandline-2.13.9.tgz"
                sh "cd /tmp/ && tar zxvf allure-commandline-2.13.9.tgz"
                sh "mkdir /var/lib/jenkins/tools"
                sh "mkdir /var/lib/jenkins/tools/ru.yandex.qatools.allure.jenkins.tools.AllureCommandlineInstallation"
                sh "mv /tmp/allure-2.13.9 /var/lib/jenkins/tools/ru.yandex.qatools.allure.jenkins.tools.AllureCommandlineInstallation/Allure"
                allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
            }
        }
        stage('Update Metrics') {
            when {
                expression { params.UPDATE_METRICS == true }
            }
            steps {
                script {
                    credentials = readFile(file: "${CREDENTIALS}")
                    lines = credentials.readLines()
                    def ACCESS_TOKEN = lines[4]
                    def CLIENT_ID = lines[6]
                    def CLIENT_SECRET = lines[7]
                    wrap([$class: "MaskPasswordsBuildWrapper",
                    varPasswordPairs: [
                        [password: ACCESS_TOKEN],
                        [password: CLIENT_ID],
                        [password: CLIENT_SECRET]
                    ]
                    ]) {
                        output = sh returnStdout: true, script: """
                        node metrics/metrics.js ${env.BUILD_NUMBER} ${TAG} ${BROWSER} ${env.BASEURL} ${CLIENT_ID} ${CLIENT_SECRET} ${ACCESS_TOKEN}
                        """
                        if (env.SLACK == 'true') {
                            slackSend (
                                baseUrl: "https://euribe.slack.com/services/hooks/jenkins-ci/",
                                tokenCredentialId: 'slack',
                                botUser: true,
                                channel: slackChannel, 
                                failOnError: true,
                                message: "${output}"
                            )
                        }
                    }
                }
            }
        }
        stage('Update testlink') {
            when {
                expression { params.UPDATE_TESTLINK == true }
            }
            steps {
                script {
                    credentials = readFile(file: "${CREDENTIALS}")
                    lines = credentials.readLines()
                    def TESTLINK_HOST = lines[5].split("=")[1]
                    def TESTLINK_KEY = lines[6].split("=")[1]
                    wrap([$class: "MaskPasswordsBuildWrapper",
                    varPasswordPairs: [
                        [password: TESTLINK_HOST],
                        [password: TESTLINK_KEY]
                    ]
                    ]) {
                        output = sh returnStdout: true,
                        script: """
                        node metrics/testlink.js ${env.TESTLINK_RUN_ID} ${TESTLINK_HOST} ${TESTLINK_KEY}
                        """
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                if (env.VIDEO == 'true') {
                    archiveArtifacts artifacts: 'cypress/videos/*.mp4'
                }
                sh 'chmod -R 777 *'
            }
        }
        failure {
            archiveArtifacts artifacts: 'cypress/screenshots/*/*.png'
        }
        unstable {
            archiveArtifacts artifacts: 'cypress/screenshots/*/*.png'
        }
    }
}
