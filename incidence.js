// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;
// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0
// BASE VERSION FORKED FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664
// UPDATED VERSION FORKED FROM AUTHOR: rphl https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5
// NEW VERSION BY AUTHOR: tzschies https://gist.github.com/tzschies/563fab70b37609bc8f2f630d566bcbc9

/*********************************************
 * CONFIGURATION PARAMETERS
 ********************************************/
// set to 'MeldeDatum' for the day when number of cases were reported
// set to 'RefDatum' for the day of start of illness
const datumType = 'MeldeDatum'

// because there are often late registrations some days later, 
// you can change the determination of the trend
// set to 1: the trend is positive, if the incidence of yesterday is higher than the week before
// set to 0: the trend is positive, if the incidence of today is higher than the week before
const trendDaysOffset = 1

// because there are often late registrations some days later, 
// you can optionally display the incidence of yesterday 
// in most cases this is the more realistic value
// set to true for showing Incidence of Yesterday
// set to false for showing the API-Value of today
const showIncidenceYesterday = false

/*****************************************************************
 * 
 * END OF CONIFURATION
 * 
 *****************************************************************/

const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k';
const apiUrlStates = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`
const apiUrlCasesLastDays = (GetLocation, StartDate) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29${GetLocation}+AND+${datumType}+%3E%3D+TIMESTAMP+%27${StartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2C${datumType}&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=${datumType}&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`

const apiUrlCases = (GetLocation) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29${GetLocation}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`


let SMALL = false
let MEDIUM = false

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

const LIMIT_DARKRED = 100
const LIMIT_RED = 50
const LIMIT_ORANGE = 35
const LIMIT_YELLOW = 25
const LIMIT_DARKRED_COLOR = new Color('9e000a')
const LIMIT_RED_COLOR = new Color('f6000f')
const LIMIT_ORANGE_COLOR = new Color('#ff7927')
const LIMIT_YELLOW_COLOR = new Color('F5D800')
const LIMIT_GREEN_COLOR = new Color('1CC747')

const GET_DAYS = 35 // 5 Wochen
const WEEK_IN_DAYS = 7;
const EWZ_GER = 83020000;
const INCIDENCE_DAYS = 28 // 3 Wochen

const shortGER = 'D'

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

const MAX_CHARACHTERS_BIG_HEADER = 15
const fontSizeBigHeader = 14
const fontSizeSmallHeader = 12


let getGermany = false
let getCounty = false
let fixedCoordinates = []
let individualName = ''
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


let data = {}
const widget = await createWidget()
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

async function createWidget() {
    if (config.widgetFamily = 'small') {
        SMALL = true
    } else if (config.widgetFamily = 'medium') {
        MEDIUM = true
    }
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
            list.addSpacer(6)
            const loadingIndicator = list.addText("Ort wird ermittelt...".toUpperCase())
            loadingIndicator.font = Font.mediumSystemFont(13)
            loadingIndicator.textOpacity = 0.5
        } else {
            list.refreshAfterDate = new Date(Date.now() + 6 * 60 * 60 * 1000)
        }
        const header = headerLabel.addText("🦠 ")
        header.font = Font.mediumSystemFont(12)
        const areanameLabel = headerLabel.addText(data[areaName].areaName)
        areaFontSize = data[areaName].areaName.length >= MAX_CHARACHTERS_BIG_HEADER ? fontSizeSmallHeader : fontSizeBigHeader;
        areanameLabel.font = Font.mediumSystemFont(areaFontSize)

        // INCIDENCE
        createIncidenceLabelBlock(list, data[areaName])
    } else {
        list.addSpacer()
        const errorLabel = list.addText("Daten nicht verfügbar. \nWidget öffnen für reload...")
        list.refreshAfterDate = new Date(Date.now() + 1 * 10 * 1000) // 10 Sekunden
        errorLabel.font = Font.mediumSystemFont(12)
        errorLabel.textColor = Color.gray()
    }

    return list
}

function getFormatedDateBeforeDays(offset) {
    let today = new Date()
    let offsetDate = new Date()
    offsetDate.setDate(today.getDate() - offset)

    let offsetTime = offsetDate.toISOString().split('T')[0]
    return (offsetTime)
}

function getCasesByDates(jsonData, StartDate, EndDate) {
    let cases = 0
    for (i = 0; i < jsonData.features.length; i++) {
        let date = new Date(jsonData.features[i].attributes[datumType])
        date = date.toISOString().split('T')[0]
        if (StartDate <= date && date <= EndDate) {
            cases = cases + parseInt(jsonData.features[i].attributes.value)
        }
    }
    return cases
}

function getIncidenceLastWeek(jsonData, EWZ) {
    let incidence = [];
    let factor = EWZ / 100000;
    for (let i = 0; i < INCIDENCE_DAYS; i++) {
        startDate = (showIncidenceYesterday) ? getFormatedDateBeforeDays(INCIDENCE_DAYS + 7 - i) : getFormatedDateBeforeDays(INCIDENCE_DAYS + 6 - i)
        endDate = (showIncidenceYesterday) ? getFormatedDateBeforeDays(INCIDENCE_DAYS - i) : getFormatedDateBeforeDays(INCIDENCE_DAYS - 1 - i)
        incidence.push((getCasesByDates(jsonData, startDate, endDate) / factor).toFixed(1))
    }
    return incidence
}

function getAreaName(attr) {
    if (individualName == '') {
        return (attr.GEN)
    } else {
        return (individualName)
    }
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
        let landkreisApi = ''
        let ewz = EWZ_GER

        if (getCounty) {
            landkreisApi = `+AND+IdBundesland=${bundeslandId}`
            ewz = parseInt(attr.EWZ_BL)
        } else if (!getGermany) {
            landkreisApi = `+AND+IdLandkreis=${landkreisId}`
            ewz = parseInt(attr.EWZ)
        }
        data = await new Request(apiUrlCasesLastDays(landkreisApi, getFormatedDateBeforeDays(GET_DAYS))).loadJSON()
        const areaCasesLastWeek = getCasesByDates(data, getFormatedDateBeforeDays(7), getFormatedDateBeforeDays(0))
        const areaCasesLastWeekYesterday = getCasesByDates(data, getFormatedDateBeforeDays(8), getFormatedDateBeforeDays(1))
        const areaCasesWeekBeforeWeek = getCasesByDates(data, getFormatedDateBeforeDays(13), getFormatedDateBeforeDays(6))
        const areaIncidenceLastWeek = getIncidenceLastWeek(data, ewz)

        data = await new Request(apiUrlCases(landkreisApi)).loadJSON()
        const areaCases = getValueFromJson(data)

        let locIncidence = 0
        if (getGermany) {
            locIncidence = areaIncidenceLastWeek[areaIncidenceLastWeek.length - 1]
        } else if (getCounty) {
            locIncidence = parseFloat(attr.cases7_bl_per_100k.toFixed(1))
        } else {
            locIncidence = parseFloat(attr.cases7_per_100k.toFixed(1))
        }

        const res = {
            landkreisId: landkreisId,
            bundeslandId: bundeslandId,
            incidence: locIncidence,
            areaCasesLastWeek: areaCasesLastWeek,
            areaCasesLastWeekYesterday: areaCasesLastWeekYesterday,
            areaCasesWeekBeforeWeek: areaCasesWeekBeforeWeek,
            areaIncidenceLastWeek: areaIncidenceLastWeek,
            areaName: getAreaName(attr),
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

function getTrendArrow(preValue, currentValue) {
    let arrow = ''
    if (parseFloat(currentValue) < parseFloat(preValue)) {
        arrow = '↓'
    } else if (parseFloat(currentValue) > parseFloat(preValue)) {
        arrow = '↑'
    } else {
        arrow = '→'
    }

    return (arrow)
}

function createUpdatedLabel(label, data) {
    const updateLabel = label.addText(`${data.updated.substr(0, 10)} `)
    updateLabel.font = Font.systemFont(8)
    updateLabel.textColor = Color.gray()
    updateLabel.leftAlignText()
}

function createIncidenceLabelBlock(labelBlock, data) {
    const bgColor = new Color('f0f0f0')
    const textColor = new Color('444444')
    const mainRowWidth = 120
    const mainRowHeight = 35
    const fontSizeLocal = 27

    const stack = labelBlock.addStack()
    stack.layoutVertically()
    stack.useDefaultPadding()
    stack.topAlignContent()

    stack.addSpacer(20)

    // MAIN ROW WITH INCIDENCE
    const stackMainRow = stack.addStack()
    stackMainRow.layoutHorizontally()
    stackMainRow.centerAlignContent()
    stackMainRow.size = new Size(mainRowWidth, mainRowHeight)

    // MAIN INCIDENCE
    let areaIncidence = (showIncidenceYesterday) ? data.areaIncidenceLastWeek[data.areaIncidenceLastWeek.length - 1] : data.incidence
    let incidence = areaIncidence >= 100 ? Math.round(areaIncidence) : parseFloat(areaIncidence).toFixed(1);
    const incidenceLabel = stackMainRow.addText(incidence.toString().replace('.', ','))
    incidenceLabel.font = Font.boldSystemFont(fontSizeLocal)
    incidenceLabel.leftAlignText();
    incidenceLabel.textColor = getIncidenceColor(incidence)

    let length = data.areaIncidenceLastWeek.length
    const incidenceTrend = getTrendArrow(data.areaIncidenceLastWeek[length - WEEK_IN_DAYS], data.areaIncidenceLastWeek[length - (trendDaysOffset + 1)])
    const incidenceLabelTrend = stackMainRow.addText('' + incidenceTrend)
    incidenceLabelTrend.font = Font.mediumSystemFont(fontSizeLocal - 4)
    incidenceLabelTrend.rightAlignText();
    incidenceLabelTrend.textColor = (incidenceTrend === '↑') ? LIMIT_RED_COLOR : LIMIT_GREEN_COLOR

    // GRAPH ONLY
    stack.addSpacer(10)
    createGraph(stack, data)

    // DATE
    const stackDate = stack.addStack()
    stackDate.layoutHorizontally()
    createUpdatedLabel(stackDate, data)
}

function createGraph(row, data) {
    let graphHeight = 40
    let graphLength = 130
    let graphRow = row.addStack()
    graphRow.centerAlignContent()
    graphRow.useDefaultPadding()
    graphRow.size = new Size(graphLength, graphHeight)

    let incidenceColumnData = []

    for (i = 0; i < data.areaIncidenceLastWeek.length; i++) {
        incidenceColumnData.push(data.areaIncidenceLastWeek[i])
    }

    let image = columnGraph(incidenceColumnData, graphLength, graphHeight).getImage()
    let img = graphRow.addImage(image)
    img.resizable = false;
    img.centerAlignImage();
}

function columnGraph(data, width, height) {
    let context = new DrawContext()
    context.size = new Size(width, height)
    context.opaque = false
    let max = Math.max(...data)
    data.forEach((value, index) => {
        context.setFillColor(getIncidenceColor(value))

        let w = (width / data.length) - 2
        let h = value / max * height
        let x = (w + 2) * index
        let y = height - h
        let rect = new Rect(x, y, w, h)
        context.fillRect(rect)
    })
    return context
}


function getIncidenceColor(incidence) {
    let color = LIMIT_GREEN_COLOR
    if (incidence >= LIMIT_DARKRED) {
        color = LIMIT_DARKRED_COLOR
    } else if (incidence >= LIMIT_RED) {
        color = LIMIT_RED_COLOR
    } else if (incidence >= LIMIT_ORANGE) {
        color = LIMIT_ORANGE_COLOR
    } else if (incidence >= LIMIT_YELLOW) {
        color = LIMIT_YELLOW_COLOR
    }
    return color
}
