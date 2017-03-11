const Github = require('github')
const eslint = require('eslint')
const exec = require('child_process').execSync
const spawn = require('child_process').spawnSync

const cli = new eslint.CLIEngine()


const setStatuses = () => {
  const gh = new Github()
  const status = authenticateWithGithub(gh, process.env)

  if (shouldSet('lint')) setLintStatus(gh, status)
  if (shouldSet('flow')) setFlowStatus(gh, status)
  if (shouldSet('jest')) setJestStatus(gh, status)
}

const shouldSet = tool =>
  process.argv.indexOf(tool) > -1

const authenticateWithGithub = (gh, { TRAVIS_EVENT_TYPE, TRAVIS_REPO_SLUG, TRAVIS_JOB_ID, GITHUB_TOKEN }) => {
  const sha = getCommitSha(TRAVIS_EVENT_TYPE)
  const repoSlug = TRAVIS_REPO_SLUG
  const target_url = `https://travis-ci.org/${repoSlug}/jobs/${TRAVIS_JOB_ID}`
  const parsedSlug = repoSlug.split('/')
  const owner = parsedSlug[0]
  const repo = parsedSlug[1]

  gh.authenticate({
    token: GITHUB_TOKEN,
    type: 'oauth',
  }, err => {
    if (err) console.error('Error authenticating GitHub', err)
  })

  return {
    sha,
    target_url,
    owner,
    repo,
  }
}


const getCommitSha = eventType => {
  if (eventType === 'push') {
    return process.env.TRAVIS_COMMIT
  }
  else if (eventType === 'pull_request') {
    const travisCommitRange = process.env.TRAVIS_COMMIT_RANGE
    const parsed = travisCommitRange.split('...')

    return parsed.length === 1 ? travisCommitRange : parsed[1]
  }

  console.error('event type \'%s\' not supported', eventType)
  return null
}


const setLintStatus = (gh, status) => {
  const stdout = exec(`git diff --name-only ${process.env.TRAVIS_COMMIT_RANGE} -- '*.js'`, { encoding: 'utf8' })
  const files = stdout  // paths of *.js files that changed in the commit/PR
      .split('\n')
      .slice(0, -1)     // Remove the extra "" caused by the last newline

  const { errorCount, warningCount, results } = cli.executeOnFiles(cli.resolveFileGlobPatterns(files))

  const description = `errors: ${errorCount} warnings: ${warningCount}`
  const success = errorCount === 0
  setStatus(gh, status, 'ESLint Report', description, success)

  const format = cli.getFormatter()
  const log = format(results)
  console.log(log)
}


const setFlowStatus = (gh, status) => {
  const { stdout } = spawn('./node_modules/.bin/flow', ['check'], { encoding: 'utf8' })
  const lines = stdout.split('\n')
  const lastLine = lines[lines.length - 2]
  const errorCount = parseInt(lastLine.replace('Found ', ''))

  const description = `errors: ${errorCount}`
  const success = errorCount === 0
  setStatus(gh, status, 'Flow Report', description, success)

  console.log(stdout)
}


const setJestStatus = (gh, status) => {
  const { stderr } = spawn('./node_modules/.bin/jest', ['--coverage'], { encoding: 'utf8' })

  const regex = /Tests:\s+(\d+)\D+(\d+)\s+total/
  const [passedCount, testCount] = regex
    .exec(stderr)
    .slice(1, 3)
    .map(num => parseInt(num))

  const description = `${passedCount} passed, ${testCount} total`
  const success = passedCount === testCount
  setStatus(gh, status, 'Jest Tests', description, success)

  console.log(stderr)
}


const setStatus = (gh, status, context, description, success) => {
  gh.repos.createStatus(Object.assign({
    context,
    description,
    state: success ? 'success' : 'failure',
  }, status), err => {
    console.log(`${context}: ${err ? 'fail' : 'success!'}`)

    if (err) {
      console.error(`${context}: Error creating status`, err)
    }
  })

  if (!success) {
    process.exitCode = 1
  }
}

setStatuses()
