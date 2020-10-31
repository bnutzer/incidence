// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0
// Basic Idea and Code Snippets 
//      FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664
//      AND FROM AUTHOR: rphl https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5
// Author: tzschies https://gist.github.com/tzschies/be551cc6939e7c1469c2e8407edab517


/**
 * Set Widgetparameter: AREA,LAT,LONG,NAME
 *
 * Examples:
 *
 * Show fix district (Landkreis): 0,51.1244,6.7353
 * Show fix state (Bundesland): 1,51.1244,6.7353 (inser some coordinates of a city of the state)
 * Show Germany: 2
 * Show local district (Landkreis): 0 (OR EMPTY)
 * Show local state (Bundesland): 1
 * 
 */

/***************************************************************************
 * 
 * Defining Colors
 * 
 ***************************************************************************/
// set to false for white background in dark mode
// set to true for gray background in dark mode
const ENABLE_SMOOTH_DARK_MODE = false;

const backgroundColor = new Color('f0f0f0')
const colorCases = new Color('fe0000 ')
const colorHealthy = new Color('008800')
const colorDeahts = new Color('202020')

/* alternative colors if smooth dark mode is enabled */
const altBackgroundColor = new Color('252525')
const altColorCases = new Color('fe0000')
const altColorHealthy = new Color('00aa00')
const altColorDeaths = new Color('f0f0f0')

/***************************************************************************
 * 
 * API URLs
 * 
 ***************************************************************************/
const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k';
const apiUrlStates = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`

const apiUrlCasesLK = (GetLandkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29${GetLandkreis}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlNewCasesLK = (GetLandkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C-1%29${GetLandkreis}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlHealthyLK = (GetLandkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuGenesen+IN%281%2C0%29${GetLandkreis}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlNewHealthyLK = (GetLandkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuGenesen+IN%281%2C-1%29${GetLandkreis}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlDeathsLK = (GetLandkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerTodesfall+IN%281%2C0%29${GetLandkreis}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiUrlNewDeathsLK = (GetLandkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerTodesfall+IN%281%2C-1%29${GetLandkreis}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`
const apiRUrl = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`

/***************************************************************************
 * 
 * Global Variables
 * 
 ***************************************************************************/
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

let getGermany = false
let getCounty = false
let fixedCoordinates = []
let individualName = ''

/***************************************************************************
 * 
 * Lets's Start ...
 * 
 ***************************************************************************/

if (args.widgetParameter) {
    const parameters = args.widgetParameter.split(',');

    if (parameters.length >= 1) {
        if (parameters[0] == 1) { getCounty = true }
        if (parameters[0] == 2) { getGermany = true }
    }

    if (parameters.length >= 3) {
        fixedCoordinates = parseLocation(args.widgetParameter)
    }
    if (parameters.length == 4) {
        individualName = parameters[3].slice()
    }
} else {}

let data = {}
const widget = await createWidget()
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

function parseLocation(input) {
    const _coords = []
    const _fixedCoordinates = input.split(";").map(coords => {
        return coords.split(',')
    })

    _fixedCoordinates.forEach(coords => {
        _coords[0] = {
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[2]),
        }
    })

    return _coords
}

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
    headerLabel.layoutHorizontally()

    if (data && typeof data[areaName] !== 'undefined') {
        if (!data[areaName].shouldCache) {
            list.addSpacer(2)
            const loadingIndicator = list.addText("Ort wird ermittelt...".toUpperCase())
            loadingIndicator.font = Font.mediumSystemFont(13)
            loadingIndicator.textOpacity = 0.5
        } else {
            list.refreshAfterDate = new Date(Date.now() + 6 * 60 * 60 * 1000)
        }
        const header = headerLabel.addText("🦠 ")
        header.font = Font.mediumSystemFont(12)
        const areanameLabel = headerLabel.addText(data[areaName].areaName)
        areanameLabel.font = Font.mediumSystemFont(14)
        list.addSpacer(2)

        // Cases Overview
        const casesLabel = list.addStack()

        casesLabel.layoutVertically()
        casesLabel.useDefaultPadding()
        casesLabel.topAlignContent()
        createCasesOverview(casesLabel, data[areaName])
    } else {
        list.addSpacer()
        const errorLabel = list.addText("Daten nicht verfügbar. \nWarten für Reload...")
        list.refreshAfterDate = new Date(Date.now() + 1 * 10 * 1000) // 10 Sekunden
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

function parseRCSV(rDataStr) {
    let lines = rDataStr.split(/(?:\r\n|\n)+/).filter(function(el) { return el.length != 0 });
    let headers = lines.splice(0, 1)[0].split(";");
    let valuesRegExp = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^\";]+)/g;
    let elements = [];
    for (let i = 0; i < lines.length; i++) {
        let element = {};
        let j = 0;

        while (matches = valuesRegExp.exec(lines[i])) {
            var value = matches[1] || matches[2];
            value = value.replace(/\"\"/g, "\"");
            element[headers[j]] = value;
            j++;
        }
        elements.push(element);
    }

    let lastR = {}
    let lastR2 = {}
    elements.forEach(item => {
        if (parseFloat(item['Schätzer_7_Tage_R_Wert']) > 0) {
            lastR2 = lastR;
            lastR = item;
        }
    })

    console.log(lastR)
    console.log(lastR2)

    let lastRArr = []
    lastRArr.push(lastR2)
    lastRArr.push(lastR)
    return lastRArr
}

async function getData(useFixedCoordsIndex = false) {
    try {
        const location = await getLocation(useFixedCoordsIndex)
        let data = await new Request(apiUrl(location)).loadJSON()
        const attr = data.features[0].attributes

        let bundeslandId = parseInt(attr.BL_ID);
        let landkreisId = parseInt(attr.RS);
        let landkreisApi = ''

        if (getCounty) {
            landkreisApi = `+AND+IdBundesland=${bundeslandId}`
        } else if (!getGermany) {
            landkreisApi = `+AND+IdLandkreis=${landkreisId}`
        }
        data = await new Request(apiUrlCasesLK(landkreisApi)).loadJSON()
        const areaCases = getValueFromJson(data)
        data = await new Request(apiUrlNewCasesLK(landkreisApi)).loadJSON()
        const areaNewCases = getValueFromJson(data)

        data = await new Request(apiUrlHealthyLK(landkreisApi)).loadJSON()
        const areaHealthy = getValueFromJson(data)
        data = await new Request(apiUrlNewHealthyLK(landkreisApi)).loadJSON()
        const areaNewHealthy = getValueFromJson(data)

        data = await new Request(apiUrlDeathsLK(landkreisApi)).loadJSON()
        const areaDeaths = getValueFromJson(data)
        data = await new Request(apiUrlNewDeathsLK(landkreisApi)).loadJSON()
        const areaNewDeaths = getValueFromJson(data)

        const rDataStr = await new Request(apiRUrl).loadString()
        const rData = parseRCSV(rDataStr)

        const res = {
            landkreisId: landkreisId,
            bundeslandId: bundeslandId,
            incidence: parseFloat(attr.cases7_per_100k.toFixed(1)),
            incidenceBL: parseFloat(attr.cases7_bl_per_100k.toFixed(1)),
            areaName: getAreaName(attr),
            areaCases: areaCases,
            areaNewCases: areaNewCases,
            areaHealthy: areaHealthy,
            areaNewHealthy: areaNewHealthy,
            areaDeaths: areaDeaths,
            areaNewDeaths: areaNewDeaths,
            nameBL: BUNDESLAENDER_SHORT[attr.BL],
            shouldCache: true,
            updated: attr.last_update,
            r_factor_today: rData[1]['Schätzer_7_Tage_R_Wert'],
            r_factor_yesterday: rData[0]['Schätzer_7_Tage_R_Wert'],
        }
        return res
    } catch (e) {
        console.log(e)
        return null
    }
}

function getAreaName(attr) {
    if (individualName == '') {
        if (getGermany) {
            return ('Deutschland')
        } else if (getCounty) {
            return (attr.BL)
        } else {
            return (attr.GEN)
        }
    } else {
        return (individualName)
    }
}

async function getLocation(fixedCoordinateIndex = false) {
    try {
        if (fixedCoordinates && typeof fixedCoordinates[0] !== 'undefined') {
            return fixedCoordinates[0]
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


function createUpdatedLabel(label, data, align = 1) {
    const areaCasesLabel = label.addText(`${data.updated.substr(0, 10)} `)
    areaCasesLabel.font = Font.systemFont(8)
    areaCasesLabel.textColor = Color.gray()
    if (align === -1) { areaCasesLabel.rightAlignText() } else { areaCasesLabel.leftAlignText() }
}

function getRTrend(today, yesterday) {
    let trend = '→'
    if (today > yesterday) {
        trend = '↗'
    } else if (today < yesterday) {
        trend = '↘'
    }
    return (trend)
}

function createCasesOverview(labelBlock, data) {
    let smoothDark = (Device.isUsingDarkAppearance() && ENABLE_SMOOTH_DARK_MODE)
    let bgColor = smoothDark ? altBackgroundColor : backgroundColor
    let cColor = smoothDark ? altColorCases : colorCases
    let hColor = smoothDark ? altColorHealthy : colorHealthy
    let dColor = smoothDark ? altColorDeaths : colorDeahts

    const stack = labelBlock.addStack()
    stack.layoutVertically()
    stack.useDefaultPadding()
    stack.topAlignContent()

    // Active Cases 
    const areaGesActiveLabel = stack.addText(formatCases(data.areaCases - data.areaHealthy - data.areaDeaths) + ' aktive Fälle ')
    areaGesActiveLabel.font = Font.mediumSystemFont(10)
    areaGesActiveLabel.lineLimit = 1
    areaGesActiveLabel.textColor = Color.gray()

    stack.addSpacer(2)

    // R-Factor with trend Overview
    if (getGermany) {
        const top = stack.addStack()
        top.layoutHorizontally()
        const rfactorStack = top.addStack();
        rfactorStack.setPadding(2, 5, 2, 2)
        rfactorStack.centerAlignContent()
        rfactorStack.backgroundColor = bgColor
        rfactorStack.cornerRadius = 6
        rfactorStack.size = new Size(63, 14)

        const rLabel = rfactorStack.addText('R: ' + data.r_factor_today + ' ' + getRTrend(data.r_factor_today, data.r_factor_yesterday))
        rLabel.font = Font.mediumSystemFont(10)
        rLabel.textColor = dColor
        rfactorStack.addSpacer()

        top.addSpacer(4)

        // const itsStack = top.addStack();
        // itsStack.setPadding(2, 5, 2, 2)
        // itsStack.centerAlignContent()
        // itsStack.backgroundColor = bgColor
        // itsStack.cornerRadius = 6
        // itsStack.size = new Size(63, 14)

        // const itsLabel = itsStack.addText('🛏 +2.155')
        // itsLabel.font = Font.mediumSystemFont(10)
        // itsLabel.textColor = dColor

        stack.addSpacer(3)
    }
    // Cases Overview
    const casesStack = stack.addStack();
    casesStack.setPadding(2, 5, 2, 2)
    casesStack.centerAlignContent()
    casesStack.backgroundColor = bgColor
    casesStack.cornerRadius = 6
    casesStack.size = new Size(130, 18)

    const casesLabelSymbol = casesStack.addText('☣︎ ')
    casesLabelSymbol.font = Font.mediumSystemFont(16)
    casesLabelSymbol.textColor = cColor
    casesStack.addSpacer(1)
    const casesLabelNew = casesStack.addText('+' + formatCases(data.areaNewCases) + ' ')
    casesLabelNew.font = Font.mediumSystemFont(12)
    casesLabelNew.textColor = cColor
    const casesLabelGesamt = casesStack.addText('(' + formatCases(data.areaCases) + ')')
    casesLabelGesamt.font = Font.mediumSystemFont(9)
    casesLabelGesamt.textColor = cColor
    casesStack.addSpacer()

    stack.addSpacer(3)

    // Healthy Overview
    const healthyStack = stack.addStack();
    healthyStack.setPadding(2, 5, 2, 2)
    healthyStack.centerAlignContent()
    healthyStack.backgroundColor = bgColor
    healthyStack.cornerRadius = 6
    healthyStack.size = new Size(130, 18)

    const healthyLabelSymbol = healthyStack.addText('♡ ')
    healthyLabelSymbol.font = Font.mediumSystemFont(12)
    healthyLabelSymbol.size = new Size(20, 12)
    healthyLabelSymbol.textColor = hColor
    healthyStack.addSpacer(1)
    const healthyLabelNew = healthyStack.addText('+' + formatCases(data.areaNewHealthy) + ' ')
    healthyLabelNew.font = Font.mediumSystemFont(12)
    healthyLabelNew.textColor = hColor
    const healthyLabelGesamt = healthyStack.addText('(' + formatCases(data.areaHealthy) + ')')
    healthyLabelGesamt.font = Font.mediumSystemFont(9)
    healthyLabelGesamt.textColor = hColor
    healthyStack.addSpacer()

    stack.addSpacer(3)

    // Deaths Overview
    const deathsStack = stack.addStack();
    deathsStack.setPadding(2, 5, 2, 2)
    deathsStack.centerAlignContent()
    deathsStack.backgroundColor = bgColor
    deathsStack.cornerRadius = 6
    deathsStack.size = new Size(130, 18)

    const deathsLabelSymbol = deathsStack.addText('† ')
    deathsLabelSymbol.font = Font.mediumSystemFont(14)
    deathsLabelSymbol.size = new Size(20, 14)
    deathsLabelSymbol.textColor = dColor
    deathsStack.addSpacer(3)
    const deathsLabelNew = deathsStack.addText('+' + formatCases(data.areaNewDeaths) + ' ')
    deathsLabelNew.font = Font.mediumSystemFont(12)
    deathsLabelNew.textColor = dColor
    const deathsLabelGesamt = deathsStack.addText('(' + formatCases(data.areaDeaths) + ')')
    deathsLabelGesamt.font = Font.mediumSystemFont(9)
    deathsLabelGesamt.textColor = dColor
    deathsStack.addSpacer()


    // DATE
    stack.addSpacer(5)
    createUpdatedLabel(stack, data)
}