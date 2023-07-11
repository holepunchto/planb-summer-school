import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import Hyperbee from 'hyperbee'

// docs.holepunch.to for more info

const coreKey = process.argv[2]
if (!coreKey) throw new Error('provide a key')
const store = new Corestore('./store')
const swarm = new Hyperswarm({
  keyPair: await store.createKeyPair('indexing')
})

const core = store.get({ key: Buffer.from(coreKey, 'hex') })
const db = new Hyperbee(core, {
  valueEncoding: 'json',
  keyEncoding: 'utf-8'
})

await core.ready()

console.log(core.length, '<-- the length')

const topic = core.discoveryKey
swarm.join(topic, { server: false })
swarm.on('connection', function (connection) {
  console.log('new connection from', connection.remotePublicKey.toString('hex'))
  store.replicate(connection)
})

process.stdin.on('data', async function (data) {
  // TODO: get `key` from bee
  const [ from, to ] = data.toString().split('-').map((str) => str.trim())

  const stream = db.createReadStream({
    gte: from,
    lte: to
  })

  for await (const node of stream) {
    console.log(node)
  }
})
