import Hypercore from 'hypercore'

// docs.holepunch.to for more info

const core = new Hypercore('./core')

await core.ready()

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
