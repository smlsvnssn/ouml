import * as ö from 'ouml'

//ö.time(()=>ö.log(ö.randomChars(100000)))

ö.log(ö.range(100).map(ö.id).toArray())

ö.log(ö.map(ö.range(100), ö.id).toArray())