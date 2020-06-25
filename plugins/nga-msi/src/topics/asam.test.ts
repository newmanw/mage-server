
// describe('asam topic', function() {

//   it('has an asam collection', async function() {

//     const conn = await msi.cre(source1)
//     const collections = await conn.getCollections()
//     const asamCollection = collections.get('asam')

//     expect(asamCollection).to.deep.equal({
//       id: 'asam',
//       links: [],
//       title: 'Anti-Shipping Activity Messages (ASAM)',
//       description:
//         'ASAM records include locations and accounts of hostile acts ' +
//         'against ships and mariners.  This data can help vessels ' +
//         'recognize and avoid potential hostile activity at sea.'
//     })
//   })

//   it('fetches recent asam records', async function() {

//     const asamResponse: NgaMsi.AsamResponse = {
//       asam: [
//         {
//           "reference": "2019-77",
//           "date": "2019-12-07",
//           "latitude": -13.238064424964307,
//           "longitude": -76.75069075407549,
//           "position": "13°14'17.03\"S \n76°45'02.49\"W",
//           "navArea": "XVI",
//           "subreg": "22",
//           "hostility": "Robbery",
//           "victim": null,
//           "description": "3 robbers boarded an anchored bulk carrier anchored in Callao. Robbers tied up a crewman and entered the forecastle storeroom. The crewman managed to escape and raised the alarm. Upon hearing the alarm, the robbers fled."
//         },
//         {
//           "reference": "2019-79",
//           "date": "2019-12-06",
//           "latitude": 1.0166666669999245,
//           "longitude": 103.93333333362239,
//           "position": "1°01'00\"N \n103°56'00\"E",
//           "navArea": "XI",
//           "subreg": "71",
//           "hostility": null,
//           "victim": "BW LOYALTY",
//           "description": "6 December, robbers attempted to board the Singapore flagged tug. The vessel was underway when it was approached by a vessel from 7 individuals and attempted to secure a rope at the ships port side. The duty officer sounded the general alarm and the boat aborted the boarding attempt."
//         }
//       ]
//     }
//     source1Api
//       .get('/api/publications/asam')
//       .query(
//         queryStringConditions(
//           queryHasOutputAndSort,
//           asamDateQueryCloseTo(Date.now() - 2 * oneMonth)
//         )
//       )
//       .reply(200, asamResponse, { 'content-type': 'application/json;charset=UTF-8' })
//     const conn = await msi.connectTo(source1)
//     const items = await conn.getItemsInCollection('asam')

//     expect(items).to.deep.equal({
//       collectionId: 'asam'!,
//       items: {
//         type: 'FeatureCollection',
//         features: [
//           {
//             id: asamResponse.asam[0].reference,
//             type: 'Feature',
//             geometry: {
//               type: 'Point',
//               coordinates: [ asamResponse.asam[0].longitude, asamResponse.asam[0].latitude ]
//             },
//             properties: asamResponse.asam[0]
//           },
//           {
//             id: asamResponse.asam[1].reference,
//             type: 'Feature',
//             geometry: {
//               type: 'Point',
//               coordinates: [ asamResponse.asam[1].longitude, asamResponse.asam[1].latitude ]
//             },
//             properties: asamResponse.asam[1]
//           }
//         ]
//       }
//     } as OgcApiFeatures.CollectionPage)
//     expect(source1Api.isDone()).to.be.true
//   })
// })