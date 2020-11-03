// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;
// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0
// BASE VERSION FORKED FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664
// UPDATED VERSION FORKED FROM AUTHOR: rphl https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5
// NEW VERSION BY AUTHOR: tzschies https://gist.github.com/tzschies/563fab70b37609bc8f2f630d566bcbc9

/**
 * Fix Coordinates/MediumWidget
 * Set First Widgetparameter for showing graph (1) or showing statistics (0)
 * Set Second and Third Widgetparameter for Coordinates
 *
 * Format: ShowGraph[,LATITUDE,LONGITUDE]
 *
 * Examples:
 *
 * Show Graph of local position: 1
 * Show Graph of fix position: 1,51.1244,6.7353
 * Show Statistics of local position: 0
 * Show Statistics of fix position: 0,51.1244,6.7353
 *
 */

/*********************************************
 * CONFIGURATION PARAMETERS
 ********************************************/

// set to 'MeldeDatum' for the day when number of cases were reported
// set to 'RefDatum' for the day of start of illness
const datumType = 'MeldeDatum';

// because there are often late registrations some days later,
// you can change the determination of the trend
// set to 1: the trend is positive, if the incidence of yesterday is higher than the week before
// set to 0: the trend is positive, if the incidence of today is higher than the week before
const trendDaysOffset = 1;

// because there are often late registrations some days later,
// you can optionally display the incidence of yesterday
// in most cases this is the more realistic value
// set to true for showing Incidence of Yesterday
// set to false for showing the API-Value of today
const showIncidenceYesterday = false;



// show the time additionally to the updated date, if not happened at midnight 
const showUpdatedTimeIfNotMidnight = true;

/*****************************************************************
 * CONSTANTS
 *****************************************************************/

const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`;
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k';
const apiUrlStates = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`
const apiUrlNewCasesLK = (LandkreisId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdLandkreis=${LandkreisId}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`;
const apiUrlCasesLKDays = (LandkreisId, StartDate) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdLandkreis=${LandkreisId}+AND+${datumType}+%3E%3D+TIMESTAMP+%27${StartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2C${datumType}&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=${datumType}&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;
const apiUrlNewCasesBL = (BundeslandId) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdBundesland=${BundeslandId}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`;
const apiUrlCasesBLDays = (BundeslandId, StartDate) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdBundesland=${BundeslandId}+AND+${datumType}+%3E%3D+TIMESTAMP+%27${StartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2C${datumType}&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=${datumType}&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;
const apiUrlNewCases = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&geometry=42.000%2C12.000&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&resultType=standard&cacheHint=true`;
const apiUrlCasesDays = (StartDate) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+${datumType}+%3E%3D+TIMESTAMP+%27${StartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2C${datumType}&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=${datumType}&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;

// distance between bottom label contents
const distanceBottomLabel = 8;

const LIMIT_DARKRED = 100;
const LIMIT_RED = 50;
const LIMIT_ORANGE = 35;
const LIMIT_YELLOW = 25;
const LIMIT_DARKRED_COLOR = new Color('9e000a');
const LIMIT_RED_COLOR = new Color('f6000f');
const LIMIT_ORANGE_COLOR = new Color('#ff7927');
const LIMIT_YELLOW_COLOR = new Color('F5D800');
const LIMIT_GREEN_COLOR = new Color('1CC747');

const GET_DAYS = 35; // 5 Wochen
const WEEK_IN_DAYS = 7;
const EWZ_GER = 83020000;
const INCIDENCE_DAYS = 28; // 3 Wochen

const shortGER = 'D';

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

/*****************************************************************
 * GLOBAL VARIABLES
 *****************************************************************/
let graphOn = true; // default is on (switch off by setting first parameter to '0')
let fixedCoordinates = [];
let individualName = '';


/*****************************************************************
 * INIT AND RUN
 *****************************************************************/
if (args.widgetParameter) {
    const parameters = args.widgetParameter.split(',');

    if (parameters.length >= 1) {
        graphOn = (parameters[0] == 1);
    }
    if (parameters.length >= 3) {
        fixedCoordinates = parseLocation(args.widgetParameter);
    }
    if (parameters.length === 4) {
        individualName = parameters[3].slice();
    }
}

initAndRun();

async function initAndRun() {
    const widget = await createWidget();
    if (!config.runsInWidget) {
        await widget.presentSmall();
    }
    Script.setWidget(widget);
    Script.complete();
}

function parseLocation(input) {
    const _coords = [];
    const _fixedCoordinates = input.split(";").map(coords => {
        return coords.split(',');
    });

    _fixedCoordinates.forEach(coords => {
        _coords[0] = {
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[2]),
        }
    });

    return _coords;
}

async function createWidget() {
    let areaName;
    let data = {};

    const _data = await getData();
    if (_data && typeof _data.areaName !== 'undefined') {
        areaName = _data.areaName;
        data[areaName] = _data;
    }
    const list = new ListWidget();
    const headerLabel = list.addStack();
    headerLabel.useDefaultPadding();
    headerLabel.centerAlignContent();
    list.setPadding(10, 10, 10, 10);
    headerLabel.layoutHorizontally();

    if (data && typeof data[areaName] !== 'undefined') {
        if (!data[areaName].shouldCache) {
            list.addSpacer(6);
            const loadingIndicator = list.addText("Ort wird ermittelt...".toUpperCase());
            loadingIndicator.font = Font.mediumSystemFont(13);
            loadingIndicator.textOpacity = 0.5;
        } else {
            list.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);
        }
        const header = headerLabel.addText("🦠 ");
        header.font = Font.mediumSystemFont(12);

        // AREA NAME
        const areanameLabel = headerLabel.addText(data[areaName].areaName);
        areanameLabel.font = Font.mediumSystemFont(12);
        areanameLabel.lineLimit = 1;

        // INCIDENCE
        createIncidenceLabelBlock(list, data[areaName]);
    } else {
        list.addSpacer()
        const errorLabel = list.addText("Daten nicht verfügbar. \nReload erfolgt... Bitte warten.");
        errorLabel.font = Font.mediumSystemFont(12);
        errorLabel.textColor = Color.gray();
        list.refreshAfterDate = new Date(Date.now() + 15 * 1000); // Reload in 15 Sekunden
    }

    return list;
}

function getFormatedDateBeforeDays(offset) {
    let today = new Date();
    let offsetDate = new Date();
    offsetDate.setDate(today.getDate() - offset);

    let offsetTime = offsetDate.toISOString().split('T')[0];
    return (offsetTime);
}

function getCasesByDates(jsonData, startDate, endDate) {
    let cases = 0;
    for (let i = 0; i < jsonData.features.length; i++) {
        let date = new Date(jsonData.features[i].attributes[datumType]);
        date = date.toISOString().split('T')[0];
        if (startDate <= date && date <= endDate) {
            cases = cases + parseInt(jsonData.features[i].attributes.value);
        }
    }
    return cases;
}

function getIncidenceLastWeek(jsonData, EWZ) {
    let incidence = [];
    let factor = EWZ / 100000;
    for (let i = 0; i < INCIDENCE_DAYS; i++) {
        let startDate = (showIncidenceYesterday) ? getFormatedDateBeforeDays(INCIDENCE_DAYS + 7 - i) : getFormatedDateBeforeDays(INCIDENCE_DAYS + 6 - i);
        let endDate = (showIncidenceYesterday) ? getFormatedDateBeforeDays(INCIDENCE_DAYS - i) : getFormatedDateBeforeDays(INCIDENCE_DAYS - 1 - i);
        incidence.push((getCasesByDates(jsonData, startDate, endDate) / factor).toFixed(1));
    }
    console.log(incidence);
    return incidence;
}

function getAreaName(attr) {
    if (individualName === '') {
        return (attr.GEN);
    } else {
        return (individualName);
    }
}

function getValueFromJson(data) {
    if (data.features[0].attributes.value != null) {
        return (parseInt(data.features[0].attributes.value));
    } else {
        return 0;
    }
}

async function getData() {
    try {
        let dataCases = await new Request(apiUrlNewCases).loadJSON();
        const cases = getValueFromJson(dataCases);

        let dataStates = await new Request(apiUrlStates).loadJSON();

        const incidencePerState = dataStates.features.map((f) => {
            return {
                BL: BUNDESLAENDER_SHORT[f.attributes.LAN_ew_GEN],
                incidence: f.attributes.cases7_bl_per_100k,
                cases: f.attributes.Fallzahl // ???
            };
        })

        const averageIncidence = incidencePerState.reduce((a, b) => a + b.incidence, 0) / incidencePerState.length;
        const location = await getLocation();
        let data = await new Request(apiUrl(location)).loadJSON();
        const attr = data.features[0].attributes;

        let bundeslandId = parseInt(attr.BL_ID);
        let landkreisId = parseInt(attr.RS);

        let lkdata = await new Request(apiUrlNewCasesLK(landkreisId)).loadJSON();
        const areaNewCases = getValueFromJson(lkdata);
        lkdata = await new Request(apiUrlCasesLKDays(landkreisId, getFormatedDateBeforeDays(GET_DAYS))).loadJSON();
        const areaCasesLastWeek = getCasesByDates(lkdata, getFormatedDateBeforeDays(7), getFormatedDateBeforeDays(0));
        const areaCasesLastWeekYesterday = getCasesByDates(lkdata, getFormatedDateBeforeDays(8), getFormatedDateBeforeDays(1));
        const areaCasesWeekBeforeWeek = getCasesByDates(lkdata, getFormatedDateBeforeDays(13), getFormatedDateBeforeDays(6));
        const areaIncidenceLastWeek = getIncidenceLastWeek(lkdata, parseInt(attr.EWZ));

        let bldata = await new Request(apiUrlNewCasesBL(bundeslandId)).loadJSON();
        const blNewCases = getValueFromJson(bldata);
        bldata = await new Request(apiUrlCasesBLDays(bundeslandId, getFormatedDateBeforeDays(GET_DAYS))).loadJSON();
        const blCasesLastWeek = getCasesByDates(bldata, getFormatedDateBeforeDays(7), getFormatedDateBeforeDays(0));
        const blCasesLastWeekYesterday = getCasesByDates(bldata, getFormatedDateBeforeDays(8), getFormatedDateBeforeDays(1));
        const blCasesWeekBeforeWeek = getCasesByDates(bldata, getFormatedDateBeforeDays(13), getFormatedDateBeforeDays(6));
        const blIncidenceLastWeek = getIncidenceLastWeek(bldata, parseInt(attr.EWZ_BL));

        data = await new Request(apiUrlCasesDays(getFormatedDateBeforeDays(GET_DAYS))).loadJSON();
        const gerCasesLastWeek = getCasesByDates(data, getFormatedDateBeforeDays(7), getFormatedDateBeforeDays(0));
        const gerCasesLastWeekYesterday = getCasesByDates(data, getFormatedDateBeforeDays(8), getFormatedDateBeforeDays(1));
        const gerCasesWeekBeforeWeek = getCasesByDates(data, getFormatedDateBeforeDays(13), getFormatedDateBeforeDays(6));
        const gerIncidenceLastWeek = getIncidenceLastWeek(data, EWZ_GER);

        return {
            landkreisId: landkreisId,
            bundeslandId: bundeslandId,
            incidence: parseFloat(attr.cases7_per_100k.toFixed(1)),
            incidenceBL: parseFloat(attr.cases7_bl_per_100k.toFixed(1)),
            areaName: getAreaName(attr),
            areaCases: parseFloat(attr.cases.toFixed(1)),
            areaNewCases: areaNewCases,
            areaCasesLastWeek: areaCasesLastWeek,
            areaCasesLastWeekYesterday: areaCasesLastWeekYesterday,
            areaCasesWeekBeforeWeek: areaCasesWeekBeforeWeek,
            areaIncidenceLastWeek: areaIncidenceLastWeek,
            nameBL: BUNDESLAENDER_SHORT[attr.BL],
            blNewCases: blNewCases,
            blCasesLastWeek: blCasesLastWeek,
            blCasesWeekBeforeWeek: blCasesWeekBeforeWeek,
            blCasesLastWeekYesterday: blCasesLastWeekYesterday,
            blIncidenceLastWeek: blIncidenceLastWeek,
            shouldCache: true,
            updated: attr.last_update,
            incidencePerState: incidencePerState,
            averageIncidence: parseFloat(averageIncidence.toFixed(1)),
            cases: cases,
            gerCasesLastWeek: gerCasesLastWeek,
            gerCasesLastWeekYesterday: gerCasesLastWeekYesterday,
            gerCasesWeekBeforeWeek: gerCasesWeekBeforeWeek,
            gerIncidenceLastWeek: gerIncidenceLastWeek,
        };
    } catch (e) {
        console.log(e);
        return null;
    }
}


async function getLocation() {
    try {
        if (fixedCoordinates && typeof fixedCoordinates[0] !== 'undefined') {
            return fixedCoordinates[0];
        } else {
            Location.setAccuracyToThreeKilometers();
            return await Location.current();
        }
    } catch (e) {
        return null;
    }
}

function addStackToLabel(label) {
    let stack = label.addStack();
    stack.layoutHorizontally();
    stack.centerAlignContent();
    stack.setPadding(2, 2, 2, 2);
    stack.cornerRadius = 6;
    stack.backgroundColor = bgColor;

    stack.size = new Size(130, 15);

    return stack;
}

function createAvgLabel(label, data) {
    let bgColor = new Color('f0f0f0');
    let textColor = new Color('444444');

    // if (Device.isUsingDarkAppearance()) {
    //     bgColor = new Color('202020');
    //     textColor = new Color('f0f0f0');
    // }

    let fontsize = 9;
    let formatedCasesArea;
    let formatedCasesBL;
    let formatedCases;

    formatedCasesArea = formatCases((data.areaCasesLastWeek / 7).toFixed(1));
    formatedCasesBL = formatCases((data.blCasesLastWeek / 7).toFixed(0));
    formatedCases = formatCases((data.gerCasesLastWeek / 7).toFixed(0));

    let casesStack = addStackToLabel(label);

    let labelCases = casesStack.addText(`Ø ${formatedCasesArea}`);
    labelCases.leftAlignText();
    labelCases.font = Font.systemFont(fontsize);
    labelCases.textColor = textColor;

    casesStack.addSpacer(distanceBottomLabel);
    let labelCases2 = casesStack.addText(`Ø ${formatedCasesBL}`);
    labelCases2.centerAlignText();
    labelCases2.font = Font.systemFont(fontsize);
    labelCases2.textColor = textColor;


    // GER CASES
    casesStack.addSpacer(distanceBottomLabel);
    let labelCases3 = casesStack.addText(`Ø ${formatedCases}`);
    labelCases3.rightAlignText();
    labelCases3.font = Font.systemFont(fontsize);
    labelCases3.textColor = textColor;

}

function createGerDailyCasesLabel(label, data) {
    let bgColor = new Color('f0f0f0');
    let textColor = new Color('444444');

    // if (Device.isUsingDarkAppearance()) {
    //     bgColor = new Color('202020');
    //     textColor = new Color('f0f0f0');
    // }

    let fontsize = 9;
    let formatedCasesArea;
    let formatedCasesBL;
    let formatedCases = formatCases(data.cases);

    formatedCases += getTrendArrow(data.gerCasesWeekBeforeWeek, data.gerCasesLastWeekYesterday);
    formatedCasesArea = getNewAreaCasesAndTrend(data);
    formatedCasesBL = getNewBLCasesAndTrend(data);

    let casesStack = addStackToLabel(label);

    let labelCases = casesStack.addText(`${formatedCasesArea}`);
    labelCases.leftAlignText();
    labelCases.font = Font.systemFont(fontsize);
    labelCases.textColor = textColor;

    casesStack.addSpacer(distanceBottomLabel);
    let labelCases2 = casesStack.addText(`${formatedCasesBL}`);
    labelCases2.centerAlignText();
    labelCases2.font = Font.systemFont(fontsize);
    labelCases2.textColor = textColor;

    // GER CASES
    casesStack.addSpacer(distanceBottomLabel);
    let labelCases3 = casesStack.addText(`+${formatedCases}`);
    labelCases3.rightAlignText();
    labelCases3.font = Font.systemFont(fontsize);
    labelCases3.textColor = textColor;
}

function formatCases(cases) {
    return new Number(cases).toLocaleString('de-DE');
}

function getTrendArrow(preValue, currentValue) {
    let arrow;
    if (parseFloat(currentValue) < parseFloat(preValue)) {
        arrow = '↓';
    } else if (parseFloat(currentValue) > parseFloat(preValue)) {
        arrow = '↑';
    } else {
        arrow = '→';
    }

    return (arrow);
}

function createUpdatedLabel(label, data) {
    let labelText = data.updated.substr(0, 10);
    if (showUpdatedTimeIfNotMidnight && data.updated.indexOf('00:00') === -1) {
        labelText += data.updated.substr(11, 6);
    }
    const updateLabel = label.addText(labelText);
    updateLabel.font = Font.systemFont(8);
    updateLabel.textColor = Color.gray();
    updateLabel.leftAlignText();
}

function createIncidenceLabelBlock(labelBlock, data) {
    let bgColor = new Color('f0f0f0');
    let textColor = new Color('444444');
    const mainRowWidth = 130;
    const mainRowHeight = 40;
    const fontSizeLocal = 27;

    const stack = labelBlock.addStack();
    stack.layoutVertically();
    stack.useDefaultPadding();
    stack.topAlignContent();

    stack.addSpacer(4);

    // MAIN ROW WITH INCIDENCE
    const stackMainRow = stack.addStack();
    stackMainRow.layoutHorizontally();
    stackMainRow.centerAlignContent();
    stackMainRow.size = new Size(mainRowWidth, mainRowHeight);

    // MAIN INCIDENCE
    let areaIncidence = (showIncidenceYesterday) ? data.areaIncidenceLastWeek[data.areaIncidenceLastWeek.length - 1] : data.incidence;
    let incidence = areaIncidence >= 100 ? Math.round(areaIncidence) : parseFloat(areaIncidence).toFixed(1);
    const incidenceLabel = stackMainRow.addText(incidence.toString().replace('.', ','));
    incidenceLabel.font = Font.boldSystemFont(fontSizeLocal);
    incidenceLabel.leftAlignText();
    incidenceLabel.textColor = getIncidenceColor(incidence);

    let length = data.areaIncidenceLastWeek.length;
    const incidenceTrend = getTrendArrow(data.areaIncidenceLastWeek[length - WEEK_IN_DAYS], data.areaIncidenceLastWeek[length - (trendDaysOffset + 1)]);
    const incidenceLabelTrend = stackMainRow.addText('' + incidenceTrend);
    incidenceLabelTrend.font = Font.mediumSystemFont(fontSizeLocal - 4);
    incidenceLabelTrend.rightAlignText();
    incidenceLabelTrend.textColor = (incidenceTrend === '↑') ? LIMIT_RED_COLOR : LIMIT_GREEN_COLOR;

    stack.addSpacer(4);
    const stackMainRight = stack.addStack();
    stackMainRight.useDefaultPadding();
    //stackMainRight.size = new Size(130, 15);
    stackMainRight.layoutHorizontally();

    // BL INCIDENCE
    const stackTop = stackMainRight.addStack();
    stackTop.backgroundColor = bgColor;
    stackTop.cornerRadius = 6;
    stackTop.setPadding(2, 3, 2, 3);
    stackTop.size = new Size(63, 14);
    stackTop.centerAlignContent();

    let blIncidence = (showIncidenceYesterday) ? data.blIncidenceLastWeek[data.blIncidenceLastWeek.length - 1] : data.incidenceBL;
    let incidenceBL = Math.round(blIncidence);
    length = data.blIncidenceLastWeek.length;
    const incidenceBLLabel = stackTop.addText(data.nameBL + ': ' + formatCases(incidenceBL) + getTrendArrow(data.blIncidenceLastWeek[length - WEEK_IN_DAYS], data.blIncidenceLastWeek[length - (trendDaysOffset + 1)]));
    incidenceBLLabel.font = Font.mediumSystemFont(10);
    incidenceBLLabel.textColor = textColor; //getIncidenceColor(blIncidence);
    incidenceBLLabel.lineLimit = 1;

    // GER INCIDENCE
    stackMainRight.addSpacer(3);
    const stackBottom = stackMainRight.addStack();
    stackBottom.backgroundColor = bgColor;
    stackBottom.cornerRadius = 6;
    stackBottom.setPadding(2, 3, 2, 3);
    stackBottom.size = new Size(63, 14);
    stackBottom.centerAlignContent();

    let gerIncidence = data.gerIncidenceLastWeek[data.gerIncidenceLastWeek.length - 1];
    let incidenceD = Math.round(gerIncidence);
    length = data.gerIncidenceLastWeek.length;
    const incidenceDLabel = stackBottom.addText(shortGER + ': ' + formatCases(incidenceD) + getTrendArrow(data.gerIncidenceLastWeek[length - WEEK_IN_DAYS], data.gerIncidenceLastWeek[length - (trendDaysOffset + 1)]));
    incidenceDLabel.font = Font.mediumSystemFont(10);
    incidenceDLabel.textColor = textColor; //getIncidenceColor(gerIncidence);
    incidenceDLabel.lineLimit = 1;

    // GRAPH OR STATISTIC
    stack.addSpacer(2);
    if (graphOn) {
        stack.addSpacer(2);
        createGraph(stack, data);
    } else {
        createAvgLabel(stack, data);
        stack.addSpacer(2);
        createGerDailyCasesLabel(stack, data);
    }

    stack.addSpacer(3);

    // DATE
    const stackDate = stack.addStack();
    stackDate.layoutHorizontally();
    createUpdatedLabel(stackDate, data);
}

function createGraph(row, data) {
    let graphHeight = 30;
    let graphWidth = 130;
    let graphRow = row.addStack();
    graphRow.centerAlignContent();
    graphRow.useDefaultPadding();
    graphRow.size = new Size(graphWidth, graphHeight);

    let incidenceColumnData = [];

    for (let i = 0; i < data.areaIncidenceLastWeek.length; i++) {
        incidenceColumnData.push(data.areaIncidenceLastWeek[i]);
    }

    let image = columnGraph(incidenceColumnData, graphWidth, graphHeight).getImage();
    let img = graphRow.addImage(image);
    img.resizable = false;
    img.centerAlignImage();
}

function columnGraph(data, width, height) {
    let context = new DrawContext();
    context.size = new Size(width, height);
    context.opaque = false;
    let max = Math.max(...data);
    data.forEach((value, index) => {
        context.setFillColor(getIncidenceColor(value));
        let w = (width / data.length) - 2;
        let h = value / max * height;
        let x = (w + 2) * index;
        let y = height - h;
        let rect = new Rect(x, y, w, h);
        context.fillRect(rect);
    });
    return context;
}


function getIncidenceColor(incidence) {
    let color = LIMIT_GREEN_COLOR;
    if (incidence >= LIMIT_DARKRED) {
        color = LIMIT_DARKRED_COLOR;
    } else if (incidence >= LIMIT_RED) {
        color = LIMIT_RED_COLOR;
    } else if (incidence >= LIMIT_ORANGE) {
        color = LIMIT_ORANGE_COLOR;
    } else if (incidence >= LIMIT_YELLOW) {
        color = LIMIT_YELLOW_COLOR;
    }
    return color;
}

function getNewAreaCasesAndTrend(data) {
    return ('+' + formatCases(data.areaNewCases) + getTrendArrow(data.areaCasesWeekBeforeWeek, data.areaCasesLastWeekYesterday));
}

function getNewBLCasesAndTrend(data) {
    return ('+' + formatCases(data.blNewCases) + getTrendArrow(data.blCasesWeekBeforeWeek, data.blCasesLastWeekYesterday));
}