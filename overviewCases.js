// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;
// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0
// BASE VERSION FORKED FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664
// UPDATED VERSION FORKED FROM AUTHOR: rphl https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5
// NEW VERSION BY AUTHOR: tzschies https://gist.github.com/tzschies/563fab70b37609bc8f2f630d566bcbc9

const backgroundColor = new Color('f0f0f0')
const colorCases = new Color('fe0000 ')
const colorHealthy = new Color('008800')
const colorDeahts = new Color('000000')

const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k';
const apiUrlStates = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`

const apiUrlCasesLK = (LandkreisId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdLandkreis=${LandkreisId}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlNewCasesLK = (LandkreisId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C-1%29+AND+IdLandkreis=${LandkreisId}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlHealthyLK = (LandkreisId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuGenesen+IN%281%2C0%29+AND+IdLandkreis=${LandkreisId}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlNewHealthyLK = (LandkreisId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuGenesen+IN%281%2C-1%29+AND+IdLandkreis=${LandkreisId}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlDeathsLK = (LandkreisId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerTodesfall+IN%281%2C0%29+AND+IdLandkreis=${LandkreisId}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlNewDeathsLK = (LandkreisId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerTodesfall+IN%281%2C-1%29+AND+IdLandkreis=${LandkreisId}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`


/**
 * Fix Coordinates/MediumWidget 
 * Set Widgetparameter for each column, seperated by ";" Format: POSITION,LAT,LONG;POSITION,LAT,LONG
 *
 * Examples:
 *
 * First fix column (No second column): 0,51.1244,6.7353
 * Second fix column (Second column is visble, MediumWidget): 1,51.1244,6.7353
 * Both Fix columns (both are visble, MediumWidget): 0,51.1244,6.7353;1,51.1244,6.7353
 * Only Second Fix (both are visble, MediumWidget): 1,51.1244,6.7353
 */

const LIMIT_DARKRED = 100
const LIMIT_RED = 50
const LIMIT_ORANGE = 35
const LIMIT_YELLOW = 25
const LIMIT_DARKRED_COLOR = new Color('f6000f') // DARERED: 9e000a
const LIMIT_RED_COLOR = new Color('f6000f')
const LIMIT_ORANGE_COLOR = new Color('#ff7927')
const LIMIT_YELLOW_COLOR = new Color('F5D800')
const LIMIT_GREEN_COLOR = new Color('1CC747')

const GET_DAYS = 35;

const BUNDESLAENDER_SHORT = {
    'Baden-Württemberg': 'BW',
    'Bayern': 'BY',
    'Berlin': 'BE',
    'Brandenburg': 'BB',
    'Bremen': 'HB',
    'Hamburg': 'HH',
    'Hessen': 'HE',
    'Mecklenburg-Vorpommern': 'MV',
    'Niedersachsen': 'NI',
    'Nordrhein-Westfalen': 'NRW',
    'Rheinland-Pfalz': 'RP',
    'Saarland': 'SL',
    'Sachsen': 'SN',
    'Sachsen-Anhalt': 'ST',
    'Schleswig-Holstein': 'SH',
    'Thüringen': 'TH'
};

let fixedCoordinates = []
if (args.widgetParameter) {
    fixedCoordinates = parseInput(args.widgetParameter)
} else {}

let data = {}
const widget = await createWidget()
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

async function createWidget() {
    const _data = await getData(0)
    let areaName;
    if (_data && typeof _data.areaName !== 'undefined') {
        areaName = _data.areaName;
        data[areaName] = _data
    }
    const list = new ListWidget()
    const headerLabel = list.addStack()
    headerLabel.useDefaultPadding()
    headerLabel.centerAlignContent()
    list.setPadding(10, 10, 10, 10)
    headerLabel.layoutVertically()

    const header = headerLabel.addText("🦠 Fallübersicht".toUpperCase())
    header.font = Font.mediumSystemFont(12)

    if (data && typeof data[areaName] !== 'undefined') {
        if (!data[areaName].shouldCache) {
            list.addSpacer(2)
            const loadingIndicator = list.addText("Ort wird ermittelt...".toUpperCase())
            loadingIndicator.font = Font.mediumSystemFont(13)
            loadingIndicator.textOpacity = 0.5
        } else {
            list.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000)
        }
        list.addSpacer(2)

        // Cases Overview
        const casesLabel = list.addStack()

        casesLabel.layoutHorizontally()
        casesLabel.useDefaultPadding()
        casesLabel.topAlignContent()
        createCasesOverview(casesLabel, data[areaName])
    } else {
        list.addSpacer()
        const errorLabel = list.addText("Daten nicht verfügbar. \nWidget öffnen für reload...")
        errorLabel.font = Font.mediumSystemFont(12)
        errorLabel.textColor = Color.gray()
    }

    return list
}

function getValueFromJson(data) {
    if (data.features[0].attributes.value != null) {
        return (parseInt(data.features[0].attributes.value))
    } else {
        return 0;
    }
}


async function getData(useFixedCoordsIndex = false) {
    try {
        const location = await getLocation(useFixedCoordsIndex)
        let data = await new Request(apiUrl(location)).loadJSON()
        const attr = data.features[0].attributes

        let bundeslandId = parseInt(attr.BL_ID);
        let landkreisId = parseInt(attr.RS);

        data = await new Request(apiUrlCasesLK(landkreisId)).loadJSON()
        const areaCases = getValueFromJson(data)
        data = await new Request(apiUrlNewCasesLK(landkreisId)).loadJSON()
        const areaNewCases = getValueFromJson(data)

        data = await new Request(apiUrlHealthyLK(landkreisId)).loadJSON()
        const areaHealthy = getValueFromJson(data)
        data = await new Request(apiUrlNewHealthyLK(landkreisId)).loadJSON()
        const areaNewHealthy = getValueFromJson(data)

        data = await new Request(apiUrlDeathsLK(landkreisId)).loadJSON()
        const areaDeaths = getValueFromJson(data)
        data = await new Request(apiUrlNewDeathsLK(landkreisId)).loadJSON()
        const areaNewDeaths = getValueFromJson(data)

        const res = {
            landkreisId: landkreisId,
            bundeslandId: bundeslandId,
            incidence: parseFloat(attr.cases7_per_100k.toFixed(1)),
            incidenceBL: parseFloat(attr.cases7_bl_per_100k.toFixed(1)),
            areaName: attr.GEN,
            areaCases: areaCases,
            areaNewCases: areaNewCases,
            areaHealthy: areaHealthy,
            areaNewHealthy: areaNewHealthy,
            areaDeaths: areaDeaths,
            areaNewDeaths: areaNewDeaths,
            nameBL: BUNDESLAENDER_SHORT[attr.BL],
            shouldCache: true,
            updated: attr.last_update,
        }
        return res
    } catch (e) {
        console.log(e)
        return null
    }
}

function parseInput(input) {
    const _coords = []
    const _fixedCoordinates = input.split(";").map(coords => {
        return coords.split(',')
    })

    _fixedCoordinates.forEach(coords => {
        _coords[parseInt(coords[0])] = {
            index: parseInt(coords[0]),
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[2])
        }
    })

    return _coords
}

async function getLocation(fixedCoordinateIndex = false) {
    try {
        if (fixedCoordinates && typeof fixedCoordinates[fixedCoordinateIndex] !== 'undefined' && Object.keys(fixedCoordinates[fixedCoordinateIndex]).length == 3) {
            return fixedCoordinates[fixedCoordinateIndex]
        } else {
            Location.setAccuracyToThreeKilometers()
            return await Location.current()
        }
    } catch (e) {
        return null;
    }
}

function formatCases(cases) {
    return formatedCases = new Number(cases).toLocaleString('de-DE')
}

function getTrendArrow(preValue, currentValue) {
    return (currentValue < preValue) ? '↓' : '↑'
}

function createUpdatedLabel(label, data, align = 1) {
    const areaCasesLabel = label.addText(`${data.updated.substr(0, 10)} `)
    areaCasesLabel.font = Font.systemFont(10)
    areaCasesLabel.textColor = Color.gray()
    if (align === -1) { areaCasesLabel.rightAlignText() } else { areaCasesLabel.leftAlignText() }
}

function createCasesOverview(labelBlock, data) {
    const stack = labelBlock.addStack()
    stack.layoutVertically()
    stack.useDefaultPadding()
    stack.topAlignContent()

    stack.addSpacer(5)

    const areanameLabel = stack.addText(data.areaName)
    areanameLabel.font = Font.mediumSystemFont(12)
    areanameLabel.lineLimit = 1

    const areaGesActiveLabel = stack.addText((data.areaCases - data.areaHealthy - data.areaDeaths) + ' aktive Fälle ')
    areaGesActiveLabel.font = Font.mediumSystemFont(10)
    areaGesActiveLabel.lineLimit = 1
    areaGesActiveLabel.textColor = Color.gray()

    stack.addSpacer(5)

    // MAIN ROW
    const stackMainRow = stack.addStack()
    stackMainRow.useDefaultPadding()
    stackMainRow.centerAlignContent()
    stackMainRow.size = new Size(125, 40)

    // Cases Overview
    const casesStack = stackMainRow.addStack();
    casesStack.backgroundColor = backgroundColor
    casesStack.cornerRadius = 4
    casesStack.setPadding(2, 3, 2, 3)
    casesStack.size = new Size(35, 40)

    const casesLabel = casesStack.addText('☣︎ \n' + data.areaCases + '\n+' + data.areaNewCases)
    casesLabel.font = Font.mediumSystemFont(10)
    casesLabel.textColor = colorCases
    space1 = stackMainRow.addStack();
    space1.size = new Size(8, 1)

    // Healthy Overview
    const healthyStack = stackMainRow.addStack();
    healthyStack.backgroundColor = backgroundColor
    healthyStack.cornerRadius = 4
    healthyStack.setPadding(2, 3, 2, 3)
    healthyStack.size = new Size(35, 40)

    const healthyLabel = healthyStack.addText('♥ \n' + data.areaHealthy + '\n+' + data.areaNewHealthy)
    healthyLabel.font = Font.mediumSystemFont(10)
    healthyLabel.textColor = colorHealthy
    space2 = stackMainRow.addStack();
    space2.size = new Size(8, 1)

    // Deaths Overview
    const deathsStack = stackMainRow.addStack();
    deathsStack.backgroundColor = backgroundColor
    deathsStack.cornerRadius = 4
    deathsStack.setPadding(2, 3, 2, 3)
    deathsStack.size = new Size(35, 40)

    const deathsLabel = deathsStack.addText('† \n' + data.areaDeaths + '\n+' + data.areaNewDeaths)
    deathsLabel.font = Font.mediumSystemFont(10)
    deathsLabel.textColor = colorDeahts

    // DATE
    stack.addSpacer(5)
    createUpdatedLabel(stack, data)
}
