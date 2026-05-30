import { createClient } from 'hafas-client'
import { profile as saarProfile } from 'hafas-client/p/saarfahrplan/index.js'

// Single shared HAFAS client using Saarfahrplan profile.
const hafas = createClient(saarProfile, 'NextTramApp/1.0 (github.com/user/next-tram)')

export default hafas
