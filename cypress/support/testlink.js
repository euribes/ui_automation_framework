/* eslint-disable no-undef, no-unused-vars */
/*
How to run it:
node testlink.js BUILD TESTLINK_HOST API_KEY
Example: node testlink.js 1 192.168.1.2 04E1643dgfts23kdldf
*/
const { TestLink } = require('testlink-xmlrpc')
const fs = require('fs')
const DIRECTORY = '../../allure-report/data/test-cases/'
const BUILD = process.argv[2]
const TESTPLAN = process.argv[3]
const HOST = process.argv[4]
const API_KEY = process.argv[5]

const testlink = new TestLink({
  host: HOST,
  path: '/testlink/lib/api/xmlrpc/v1/xmlrpc.php',
  port: 80,
  secure: false,
  apiKey: API_KEY
})

async function addResultForCase(testCaseId, testPlanId, tcStatus, buildId) {
  let testCase = await testlink.setTestCaseExecutionResult({
    testcaseid: testCaseId,
    testplanid: testPlanId,
    status: tcStatus,
    buildid: buildId,
    steps: []
  })
  return testCase
}

/**
 * TC status => {status:status}
 * 'p' -> Passed
 * 'b' -> Blocked
 * 'r' -> Retest
 * 'f' -> Failed
 * */
if (BUILD !== undefined) {
  fs.readdir(DIRECTORY, (err, files) => {
    if (!err) {
      files.forEach((file) => {
        let data = fs.readFileSync(DIRECTORY + file, 'utf8')
        let body = JSON.parse(data)
        if (body.extra.tags[1] !== undefined) {
          for (let i = 0; i < body.extra.tags.length; i++) {
            let statusBody
            if (body.extra.tags[i].substring(0, 2) === 'ID') {
              if (body.status === 'passed') {
                statusBody = 'p'
              } else if (body.status === 'failed') {
                statusBody = 'f'
              } else if (body.status === 'blocked') {
                statusBody = 'b'
              } else if (body.status === 'untested') {
                statusBody = 'n'
              }
              addResultForCase(body.extra.tags[i].substring(2), TESTPLAN, statusBody, BUILD)
            }
          }
        }
      })
    }
  })
}
