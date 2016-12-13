import Keybase from './keybase'

const Entities = new Mongo.Collection('entities_collection', { connection: null })

const providers = {
  keybase: Keybase,
}

const lookupAddress = async (addr) => {
  let providerName = null
  let data = null
  for (providerName of Object.keys(providers)) {
    data = await providers[providerName].lookupEthAddress(addr)
    if (data) break
  }
  return { providerName, data }
}

class Identity {
  static format(entity) {
    return providers[entity.identityProvider].format(entity.data)
    /* if (addr === EthAccounts.findOne().address) {
      return 'Me'
    }
    return addr*/
  }

  static async get(addr, raw = false) {
    let entity = Entities.findOne({ _id: `e_${addr}` })

    if (!entity) {
      const { providerName, data } = await lookupAddress(addr)
      if (providerName && data) {
        Identity.set(addr, providerName, data)
        entity = Entities.findOne({ _id: `e_${addr}` })
      }
    }

    if (!raw) entity = Identity.format(entity)
    return entity
  }

  static set(addr, identityProvider, entityObj) {
    const entity = {
      identityProvider,
      data: entityObj,
    }
    console.log(entity)
    Entities.upsert(`e_${addr}`, entity)
  }
}

export default Identity