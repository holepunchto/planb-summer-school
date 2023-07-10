import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'

// docs.holepunch.to for more info

const storePath = process.argv[2] || './store'
const coreKey = process.argv[3]
const store = new Corestore(storePath)
const swarm = new Hyperswarm()

const core = coreKey
  ? store.get({ key: Buffer.from(coreKey, 'hex') })
  : store.get({ name: 'local-chat' })

await core.ready()

const topic = Buffer.alloc(32).fill('plan-b-mathias')
swarm.join(topic)
swarm.on('connection', function (connection) {
  console.log('new connection from', connection.remotePublicKey.toString('hex'))
  store.replicate(connection)
})

core.on('append', function () {
  console.log('new messages appended...', core.length)
})

console.log(core.length, '<-- core.length')
console.log(core.key.toString('hex'), '<-- the public key')

const start = Math.max(0, core.length - 10)
core.createReadStream({ start, live: true })
  .on('data', function (data) {
    console.log('-->', data.toString())
  })

process.stdin.on('data', function (msg) {
  core.append(msg.toString().trim())
})

// const lastBlock = await core.get(core.length - 1)

// console.log(lastBlock.toString())
