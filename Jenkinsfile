#!/usr/bin/env groovy
slackChannel = "automation"

pipeline {
    agent {
        docker {
            image "cypress/included:8.6.0"
            args "--entrypoint='' -u 0:0"
        }
    }
    environment {
        CREDENTIALS = credentials('creds.txt')
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
                    stage("Cypress Run") {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            credentials = readFile(file: "${CREDENTIALS}")
                            lines = credentials.readLines()
                            def USERNAME = lines[0]
                            def PASSWORD = lines[1]
                            wrap([$class: "MaskPasswordsBuildWrapper",
                                varPasswordPairs: [
                                    [password: USERNAME],
                                    [password: PASSWORD],
                                ]]) {
                                timeout(time: 260) {
                                    sh "npx cypress run -e '${USERNAME},${PASSWORD} --browser ${BROWSER} --config video=${VIDEO},numTestsKeptInMemory=0,videoCompression=51"
                                }
                            }
                        }
                    }
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
