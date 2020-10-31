# incidence
COVID-19 Inzidenz-Widget für iOS innerhalb Deutschlands 🇩🇪 (Kreis/Stadt + Bundesland + Deutschland + Trend)

<img src=graph_Only.jpg>

Skript muss in der App Scriptable importiert werden und kann dann als Widget genutzt werden. 

Das Widget kann parametriert werden. Durch Übergabe des ersten Parameters kann umgeschaltet werden zwischen Kurvenanzeige und Statistik-Anzeige:

Format der Parameterübergabe
Gebiet, LAT, LON, Name

Erklärung:
Gebiet = 0: Landkreis
Gebiet = 1: Bundesland
Gebiet = 2: Deutschland
LAT,LON = Koordinaten
Name = Eigene Bezeichnung des Landkreises/Bundeslands (optional)

Beispiele:

lokaler Landkreis: ""
lokales Bundesland: "1"
Fremdes Bundesland Bayern: "1,48.96,12.38"
Fremder Landkreis Regensburg mit eigenem Namen: "1,48.96,12.38,LK Regensburg"
Deutschland: "2"


