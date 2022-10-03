import * as ö from './ö.mjs'

const testData = [
	{
		id: 1,
		first_name: 'Gerhard',
		last_name: 'Arguile',
		email: 'garguile0@japanpost.jp',
		gender: 'Male',
		ip_address: '38.133.94.3',
	},
	{
		id: 2,
		first_name: 'Oran',
		last_name: 'Geal',
		email: 'ogeal1@123-reg.co.uk',
		gender: 'Male',
		ip_address: '153.103.131.153',
	},
	{
		id: 3,
		first_name: 'Tonia',
		last_name: 'Sigmund',
		email: 'tsigmund2@delicious.com',
		gender: 'Female',
		ip_address: '68.87.120.182',
	},
	{
		id: 4,
		first_name: 'Desiree',
		last_name: 'Vowells',
		email: 'dvowells3@ifeng.com',
		gender: 'Female',
		ip_address: '213.11.182.11',
	},
	{
		id: 5,
		first_name: 'Winfred',
		last_name: 'Summerell',
		email: 'wsummerell4@techcrunch.com',
		gender: 'Male',
		ip_address: '144.138.4.166',
	},
	{
		id: 6,
		first_name: 'Currey',
		last_name: 'Batson',
		email: 'cbatson5@nsw.gov.au',
		gender: 'Genderqueer',
		ip_address: '114.119.217.153',
	},
	{
		id: 7,
		first_name: 'Lucias',
		last_name: 'Eakin',
		email: 'leakin6@com.com',
		gender: 'Male',
		ip_address: '254.63.197.80',
	},
	{
		id: 8,
		first_name: 'Torry',
		last_name: 'Skilbeck',
		email: 'tskilbeck7@studiopress.com',
		gender: 'Male',
		ip_address: '95.3.199.46',
	},
	{
		id: 9,
		first_name: 'Reinhold',
		last_name: 'Presslee',
		email: 'rpresslee8@economist.com',
		gender: 'Male',
		ip_address: '238.151.18.109',
	},
	{
		id: 10,
		first_name: 'Bree',
		last_name: 'Chandler',
		email: 'bchandler9@sciencedaily.com',
		gender: 'Female',
		ip_address: '17.3.42.32',
	},
]
ö.log(`
---
`)

//ö.log(ö.groupBy(testData, 'gender'))

ö.log(ö.groupBy(testData, (v, i, a) => (v.gender == 'Male' ? 'Man' : 'Andra')))
ö.log(ö.normalise(100, 0, 1000))
// ö.log(ö.toHsla('hsl(360, 10%, 90%)'))
// ö.log(ö.createEnum(['a', 'b', 'c']))
// ö.log(({ a: { b: { c: {} } } }.a.b.c.test = '?'))

ö.log(`
---
`)
