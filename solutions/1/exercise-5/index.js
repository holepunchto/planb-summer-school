import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'

// docs.holepunch.to for more info

const storePath = process.argv[2] || './store'
const coreKey = process.argv[3]
const store = new Corestore(storePath)

const core = store.get({ name: 'local-chat' })

const keys = process.argv.slice(3)

for (const key of keys) {
  const otherCore = store.get({ key: Buffer.from(key, 'hex') })

  await otherCore.ready()

  console.log('listening for', otherCore.key.toString('hex'))

  otherCore.on('append', function () {
    console.log('new messages appended...', otherCore.length)
  })

  const start = Math.max(0, otherCore.length - 10)
  otherCore.createReadStream({ start, live: true })
    .on('data', function (data) {
      console.log('-->', data.toString())
    })
}

await core.ready()

const swarm = new Hyperswarm({
  keyPair: await store.createKeyPair('local-chat')
})

const topic = Buffer.alloc(32).fill('random_string')
swarm.join(topic)
swarm.on('connection', function (connection) {
  console.log('new connection from', connection.remotePublicKey.toString('hex'))
  store.replicate(connection)
})

console.log(core.length, '<-- core.length')
console.log(core.key.toString('hex'), '<-- my public key')

process.stdin.on('data', function (msg) {
  core.append(msg.toString().trim())
})

// const lastBlock = await core.get(core.length - 1)

// console.log(lastBlock.toString())
