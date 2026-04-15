HEAD
import RTTSMode from './RTTS.jsx';
3a37ea0 (Add RTTS mode)
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
const STATCAST_PLAYERS = [{"id":"592450","name":"Aaron Judge","type":"batter"},{"id":"592662","name":"Aaron Nola","type":"pitcher"},{"id":"675911","name":"Adley Rutschman","type":"batter"},{"id":"691177","name":"Andrew Painter","type":"pitcher"},{"id":"669742","name":"Austin Riley","type":"batter"},{"id":"694973","name":"Blade Tidwell","type":"pitcher"},{"id":"663538","name":"Bo Bichette","type":"batter"},{"id":"694497","name":"Bobby Witt Jr.","type":"batter"},{"id":"657656","name":"Bryce Elder","type":"pitcher"},{"id":"664285","name":"Bryce Harper","type":"batter"},{"id":"682641","name":"Cade Cavalli","type":"pitcher"},{"id":"660670","name":"Carlos Correa","type":"batter"},{"id":"623352","name":"Carlos Rodon","type":"pitcher"},{"id":"622491","name":"Chris Bassitt","type":"pitcher"},{"id":"665296","name":"Chris Sale","type":"pitcher"},{"id":"642715","name":"Christian Yelich","type":"batter"},{"id":"666157","name":"Clarke Schmidt","type":"pitcher"},{"id":"593423","name":"Clayton Kershaw","type":"pitcher"},{"id":"680977","name":"Colt Keith","type":"batter"},{"id":"683737","name":"Corbin Carroll","type":"batter"},{"id":"676801","name":"Corey Seager","type":"batter"},{"id":"661403","name":"Cristian Javier","type":"pitcher"},{"id":"572816","name":"DJ LeMahieu","type":"batter"},{"id":"669456","name":"Dylan Cease","type":"pitcher"},{"id":"678882","name":"Elly De La Cruz","type":"batter"},{"id":"681911","name":"Evan Carter","type":"batter"},{"id":"671217","name":"Fernando Tatis Jr.","type":"batter"},{"id":"666201","name":"Framber Valdez","type":"pitcher"},{"id":"608036","name":"Freddie Freeman","type":"batter"},{"id":"605400","name":"Freddy Peralta","type":"pitcher"},{"id":"671277","name":"George Kirby","type":"pitcher"},{"id":"594798","name":"Gerrit Cole","type":"pitcher"},{"id":"682998","name":"Gunnar Henderson","type":"batter"},{"id":"676596","name":"Hunter Brown","type":"pitcher"},{"id":"678626","name":"Hunter Greene","type":"pitcher"},{"id":"686668","name":"Jackson Chourio","type":"batter"},{"id":"694699","name":"Jackson Chourio","type":"batter"},{"id":"681536","name":"Jackson Holliday","type":"batter"},{"id":"680757","name":"Jackson Merrill","type":"batter"},{"id":"680734","name":"James Wood","type":"batter"},{"id":"594807","name":"Josh Bell","type":"batter"},{"id":"664023","name":"Juan Soto","type":"batter"},{"id":"683002","name":"Julio Rodriguez","type":"batter"},{"id":"641482","name":"Kevin Gausman","type":"pitcher"},{"id":"657277","name":"Kodai Senga","type":"pitcher"},{"id":"607072","name":"Kyle Hendricks","type":"pitcher"},{"id":"680694","name":"Logan Webb","type":"pitcher"},{"id":"663511","name":"Luis Castillo","type":"pitcher"},{"id":"668678","name":"MacKenzie Gore","type":"pitcher"},{"id":"671096","name":"Marcus Semien","type":"batter"},{"id":"670541","name":"Matt Olson","type":"batter"},{"id":"596001","name":"Max Fried","type":"pitcher"},{"id":"683614","name":"Mick Abel","type":"pitcher"},{"id":"514888","name":"Miguel Cabrera","type":"batter"},{"id":"663624","name":"Mike Trout","type":"batter"},{"id":"665742","name":"Mookie Betts","type":"batter"},{"id":"624577","name":"Nolan Arenado","type":"batter"},{"id":"605141","name":"Paul Goldschmidt","type":"batter"},{"id":"656302","name":"Paul Skenes","type":"pitcher"},{"id":"656305","name":"Pete Alonso","type":"batter"},{"id":"669373","name":"Reid Detmers","type":"pitcher"},{"id":"686428","name":"Roki Sasaki","type":"pitcher"},{"id":"666182","name":"Ronald Acuna Jr.","type":"batter"},{"id":"663554","name":"Sandy Alcantara","type":"pitcher"},{"id":"657081","name":"Shane Bieber","type":"pitcher"},{"id":"660271","name":"Shohei Ohtani","type":"batter"},{"id":"660271_p","name":"Shohei Ohtani (P)","type":"pitcher"},{"id":"677651","name":"Spencer Strider","type":"pitcher"},{"id":"669257","name":"Spencer Torkelson","type":"batter"},{"id":"682243","name":"Taj Bradley","type":"pitcher"},{"id":"668709","name":"Trea Turner","type":"batter"},{"id":"666214","name":"Tyler Glasnow","type":"pitcher"},{"id":"681624","name":"Wyatt Langford","type":"batter"},{"id":"687799","name":"Xavier Edwards","type":"batter"},{"id":"663728","name":"Yordan Alvarez","type":"batter"},{"id":"656371","name":"Zac Gallen","type":"pitcher"},{"id":"621111","name":"Zack Wheeler","type":"pitcher"}];
const STATCAST_TENDENCIES = {"meta":{"total_pitches":2700000,"batters":40,"pitchers":39,"season":"2025-2026","note":"Tendency profiles based on 2025-2026 season stats"},"batters":{"592450":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":107,"avg":0.218,"obp":0.321,"slg":0.388,"k_pct":0.255,"bb_pct":0.102,"hard_hit":0.36,"outcomes":{"1B":0.1398,"2B":0.032,"3B":0.001,"HR":0.0453,"BB":0.1025,"K":0.2547,"OUT":0.4079,"GIDP":0.0087,"HBP":0.0071,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":134,"avg":0.231,"obp":0.295,"slg":0.446,"k_pct":0.212,"bb_pct":0.065,"hard_hit":0.388,"outcomes":{"1B":0.1206,"2B":0.051,"3B":0.0123,"HR":0.0467,"BB":0.0649,"K":0.2118,"OUT":0.4189,"GIDP":0.0532,"HBP":0.0198,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":198,"avg":0.184,"obp":0.249,"slg":0.318,"k_pct":0.301,"bb_pct":0.065,"hard_hit":0.398,"outcomes":{"1B":0.0986,"2B":0.0597,"3B":0.001,"HR":0.0243,"BB":0.0654,"K":0.3011,"OUT":0.3936,"GIDP":0.0331,"HBP":0.0176,"SF":0.0056},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":109,"avg":0.212,"obp":0.287,"slg":0.42,"k_pct":0.334,"bb_pct":0.074,"hard_hit":0.525,"outcomes":{"1B":0.1039,"2B":0.0541,"3B":0.0089,"HR":0.0453,"BB":0.0744,"K":0.334,"OUT":0.3682,"GIDP":0.0093,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":148,"avg":0.153,"obp":0.248,"slg":0.28,"k_pct":0.31,"bb_pct":0.095,"hard_hit":0.49,"outcomes":{"1B":0.0862,"2B":0.0285,"3B":0.0166,"HR":0.0218,"BB":0.0954,"K":0.3105,"OUT":0.4029,"GIDP":0.0277,"HBP":0.001,"SF":0.0095},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":120,"avg":0.21,"obp":0.292,"slg":0.429,"k_pct":0.267,"bb_pct":0.082,"hard_hit":0.404,"outcomes":{"1B":0.1063,"2B":0.0351,"3B":0.0235,"HR":0.0455,"BB":0.0821,"K":0.2668,"OUT":0.4028,"GIDP":0.036,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":175,"avg":0.169,"obp":0.247,"slg":0.328,"k_pct":0.33,"bb_pct":0.079,"hard_hit":0.446,"outcomes":{"1B":0.0826,"2B":0.0465,"3B":0.0057,"HR":0.0337,"BB":0.0785,"K":0.3299,"OUT":0.3953,"GIDP":0.0257,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":487,"avg":0.216,"obp":0.284,"slg":0.41,"k_pct":0.287,"bb_pct":0.081,"hard_hit":0.499}},"660271":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":167,"avg":0.256,"obp":0.331,"slg":0.534,"k_pct":0.239,"bb_pct":0.075,"hard_hit":0.41,"outcomes":{"1B":0.1267,"2B":0.0532,"3B":0.001,"HR":0.0746,"BB":0.0753,"K":0.2389,"OUT":0.3889,"GIDP":0.0393,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":114,"avg":0.207,"obp":0.293,"slg":0.417,"k_pct":0.228,"bb_pct":0.086,"hard_hit":0.5,"outcomes":{"1B":0.0996,"2B":0.044,"3B":0.0232,"HR":0.04,"BB":0.0863,"K":0.2278,"OUT":0.4086,"GIDP":0.0474,"HBP":0.0168,"SF":0.0063},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":160,"avg":0.161,"obp":0.252,"slg":0.258,"k_pct":0.297,"bb_pct":0.091,"hard_hit":0.378,"outcomes":{"1B":0.1065,"2B":0.0326,"3B":0.001,"HR":0.0207,"BB":0.0914,"K":0.2969,"OUT":0.41,"GIDP":0.0313,"HBP":0.0085,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":198,"avg":0.196,"obp":0.269,"slg":0.367,"k_pct":0.339,"bb_pct":0.073,"hard_hit":0.394,"outcomes":{"1B":0.1079,"2B":0.0453,"3B":0.001,"HR":0.0414,"BB":0.0732,"K":0.3385,"OUT":0.3896,"GIDP":0.001,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":96,"avg":0.173,"obp":0.273,"slg":0.288,"k_pct":0.276,"bb_pct":0.1,"hard_hit":0.333,"outcomes":{"1B":0.1065,"2B":0.0411,"3B":0.001,"HR":0.024,"BB":0.0999,"K":0.2756,"OUT":0.3886,"GIDP":0.0318,"HBP":0.0264,"SF":0.0052},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":165,"avg":0.224,"obp":0.303,"slg":0.439,"k_pct":0.256,"bb_pct":0.079,"hard_hit":0.469,"outcomes":{"1B":0.1227,"2B":0.0433,"3B":0.001,"HR":0.0566,"BB":0.0793,"K":0.2561,"OUT":0.4037,"GIDP":0.0353,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":109,"avg":0.151,"obp":0.239,"slg":0.23,"k_pct":0.352,"bb_pct":0.088,"hard_hit":0.318,"outcomes":{"1B":0.1028,"2B":0.0324,"3B":0.0011,"HR":0.0147,"BB":0.0881,"K":0.3516,"OUT":0.3892,"GIDP":0.0093,"HBP":0.0011,"SF":0.0097},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":428,"avg":0.216,"obp":0.288,"slg":0.401,"k_pct":0.284,"bb_pct":0.085,"hard_hit":0.522}},"664023":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":104,"avg":0.203,"obp":0.332,"slg":0.33,"k_pct":0.203,"bb_pct":0.129,"hard_hit":0.325,"outcomes":{"1B":0.1365,"2B":0.0303,"3B":0.0121,"HR":0.0242,"BB":0.1288,"K":0.2029,"OUT":0.3935,"GIDP":0.0297,"HBP":0.024,"SF":0.0178},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":93,"avg":0.214,"obp":0.308,"slg":0.371,"k_pct":0.169,"bb_pct":0.093,"hard_hit":0.365,"outcomes":{"1B":0.1383,"2B":0.0347,"3B":0.001,"HR":0.0401,"BB":0.0935,"K":0.1685,"OUT":0.4523,"GIDP":0.0329,"HBP":0.0214,"SF":0.0173},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":149,"avg":0.182,"obp":0.295,"slg":0.282,"k_pct":0.234,"bb_pct":0.114,"hard_hit":0.517,"outcomes":{"1B":0.1215,"2B":0.0392,"3B":0.001,"HR":0.0198,"BB":0.1137,"K":0.2345,"OUT":0.411,"GIDP":0.0459,"HBP":0.0124,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":113,"avg":0.211,"obp":0.339,"slg":0.329,"k_pct":0.247,"bb_pct":0.129,"hard_hit":0.541,"outcomes":{"1B":0.1278,"2B":0.0566,"3B":0.0178,"HR":0.0086,"BB":0.1285,"K":0.2467,"OUT":0.3733,"GIDP":0.0123,"HBP":0.0051,"SF":0.0232},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":174,"avg":0.19,"obp":0.352,"slg":0.338,"k_pct":0.247,"bb_pct":0.162,"hard_hit":0.441,"outcomes":{"1B":0.1219,"2B":0.0215,"3B":0.0119,"HR":0.0344,"BB":0.162,"K":0.2475,"OUT":0.3811,"GIDP":0.0177,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":166,"avg":0.214,"obp":0.363,"slg":0.34,"k_pct":0.192,"bb_pct":0.149,"hard_hit":0.524,"outcomes":{"1B":0.1548,"2B":0.023,"3B":0.0076,"HR":0.029,"BB":0.1488,"K":0.1924,"OUT":0.4217,"GIDP":0.0136,"HBP":0.001,"SF":0.0081},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":165,"avg":0.184,"obp":0.307,"slg":0.314,"k_pct":0.266,"bb_pct":0.123,"hard_hit":0.486,"outcomes":{"1B":0.1072,"2B":0.0481,"3B":0.0058,"HR":0.0234,"BB":0.1228,"K":0.2659,"OUT":0.3901,"GIDP":0.0329,"HBP":0.0027,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":481,"avg":0.234,"obp":0.338,"slg":0.386,"k_pct":0.223,"bb_pct":0.128,"hard_hit":0.403}},"666182":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":144,"avg":0.281,"obp":0.382,"slg":0.472,"k_pct":0.177,"bb_pct":0.101,"hard_hit":0.369,"outcomes":{"1B":0.1819,"2B":0.0476,"3B":0.0107,"HR":0.0407,"BB":0.1012,"K":0.1769,"OUT":0.4099,"GIDP":0.0234,"HBP":0.001,"SF":0.0068},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":81,"avg":0.277,"obp":0.322,"slg":0.411,"k_pct":0.166,"bb_pct":0.044,"hard_hit":0.474,"outcomes":{"1B":0.1891,"2B":0.0529,"3B":0.026,"HR":0.0094,"BB":0.0444,"K":0.1661,"OUT":0.4391,"GIDP":0.033,"HBP":0.0292,"SF":0.0107},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":123,"avg":0.259,"obp":0.332,"slg":0.411,"k_pct":0.231,"bb_pct":0.072,"hard_hit":0.353,"outcomes":{"1B":0.1761,"2B":0.0483,"3B":0.001,"HR":0.0339,"BB":0.0722,"K":0.2307,"OUT":0.4292,"GIDP":0.0064,"HBP":0.0013,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":161,"avg":0.219,"obp":0.305,"slg":0.348,"k_pct":0.25,"bb_pct":0.086,"hard_hit":0.555,"outcomes":{"1B":0.1593,"2B":0.0211,"3B":0.0088,"HR":0.03,"BB":0.086,"K":0.2499,"OUT":0.4173,"GIDP":0.0114,"HBP":0.001,"SF":0.0152},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":150,"avg":0.197,"obp":0.274,"slg":0.314,"k_pct":0.27,"bb_pct":0.078,"hard_hit":0.339,"outcomes":{"1B":0.1323,"2B":0.029,"3B":0.017,"HR":0.0182,"BB":0.0779,"K":0.2698,"OUT":0.4475,"GIDP":0.0062,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":193,"avg":0.238,"obp":0.325,"slg":0.406,"k_pct":0.231,"bb_pct":0.086,"hard_hit":0.527,"outcomes":{"1B":0.1586,"2B":0.0228,"3B":0.0265,"HR":0.0305,"BB":0.0863,"K":0.231,"OUT":0.4175,"GIDP":0.0102,"HBP":0.001,"SF":0.0155},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":180,"avg":0.229,"obp":0.293,"slg":0.32,"k_pct":0.284,"bb_pct":0.065,"hard_hit":0.542,"outcomes":{"1B":0.1641,"2B":0.0388,"3B":0.0243,"HR":0.0014,"BB":0.0646,"K":0.2836,"OUT":0.3857,"GIDP":0.016,"HBP":0.001,"SF":0.0204},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":483,"avg":0.267,"obp":0.324,"slg":0.421,"k_pct":0.23,"bb_pct":0.076,"hard_hit":0.403}},"682998":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":83,"avg":0.261,"obp":0.339,"slg":0.539,"k_pct":0.249,"bb_pct":0.078,"hard_hit":0.472,"outcomes":{"1B":0.1394,"2B":0.0338,"3B":0.0196,"HR":0.0683,"BB":0.0777,"K":0.2489,"OUT":0.3728,"GIDP":0.017,"HBP":0.0215,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":192,"avg":0.209,"obp":0.273,"slg":0.405,"k_pct":0.221,"bb_pct":0.064,"hard_hit":0.552,"outcomes":{"1B":0.1161,"2B":0.0412,"3B":0.001,"HR":0.051,"BB":0.0641,"K":0.2207,"OUT":0.4478,"GIDP":0.0538,"HBP":0.0033,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":153,"avg":0.19,"obp":0.271,"slg":0.33,"k_pct":0.303,"bb_pct":0.081,"hard_hit":0.349,"outcomes":{"1B":0.1019,"2B":0.0613,"3B":0.001,"HR":0.0255,"BB":0.0811,"K":0.3032,"OUT":0.3906,"GIDP":0.0254,"HBP":0.0089,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":197,"avg":0.165,"obp":0.242,"slg":0.338,"k_pct":0.336,"bb_pct":0.077,"hard_hit":0.386,"outcomes":{"1B":0.0813,"2B":0.0372,"3B":0.0048,"HR":0.042,"BB":0.077,"K":0.3356,"OUT":0.3872,"GIDP":0.0078,"HBP":0.0052,"SF":0.0218},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":200,"avg":0.173,"obp":0.27,"slg":0.329,"k_pct":0.311,"bb_pct":0.097,"hard_hit":0.399,"outcomes":{"1B":0.0865,"2B":0.046,"3B":0.0124,"HR":0.0283,"BB":0.0968,"K":0.3107,"OUT":0.4048,"GIDP":0.0124,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":136,"avg":0.205,"obp":0.301,"slg":0.358,"k_pct":0.259,"bb_pct":0.096,"hard_hit":0.415,"outcomes":{"1B":0.1333,"2B":0.0277,"3B":0.0069,"HR":0.0372,"BB":0.0958,"K":0.2588,"OUT":0.3883,"GIDP":0.0374,"HBP":0.0136,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":176,"avg":0.176,"obp":0.253,"slg":0.355,"k_pct":0.317,"bb_pct":0.078,"hard_hit":0.361,"outcomes":{"1B":0.0897,"2B":0.0293,"3B":0.0193,"HR":0.0373,"BB":0.0777,"K":0.3173,"OUT":0.3854,"GIDP":0.0256,"HBP":0.0014,"SF":0.0169},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":499,"avg":0.218,"obp":0.286,"slg":0.419,"k_pct":0.285,"bb_pct":0.082,"hard_hit":0.395}},"694497":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":143,"avg":0.243,"obp":0.345,"slg":0.339,"k_pct":0.189,"bb_pct":0.103,"hard_hit":0.404,"outcomes":{"1B":0.1947,"2B":0.0229,"3B":0.002,"HR":0.023,"BB":0.1028,"K":0.1891,"OUT":0.4228,"GIDP":0.0276,"HBP":0.0011,"SF":0.0141},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":151,"avg":0.265,"obp":0.339,"slg":0.453,"k_pct":0.168,"bb_pct":0.074,"hard_hit":0.365,"outcomes":{"1B":0.1626,"2B":0.0466,"3B":0.0272,"HR":0.0288,"BB":0.0739,"K":0.1677,"OUT":0.43,"GIDP":0.0413,"HBP":0.0185,"SF":0.0035},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":144,"avg":0.243,"obp":0.337,"slg":0.381,"k_pct":0.201,"bb_pct":0.094,"hard_hit":0.411,"outcomes":{"1B":0.173,"2B":0.0266,"3B":0.0207,"HR":0.0232,"BB":0.0936,"K":0.2011,"OUT":0.4026,"GIDP":0.0335,"HBP":0.0136,"SF":0.012},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":110,"avg":0.218,"obp":0.285,"slg":0.329,"k_pct":0.265,"bb_pct":0.067,"hard_hit":0.371,"outcomes":{"1B":0.1632,"2B":0.0273,"3B":0.001,"HR":0.027,"BB":0.0667,"K":0.2651,"OUT":0.4158,"GIDP":0.0109,"HBP":0.0197,"SF":0.0033},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":132,"avg":0.166,"obp":0.265,"slg":0.216,"k_pct":0.244,"bb_pct":0.099,"hard_hit":0.386,"outcomes":{"1B":0.133,"2B":0.0231,"3B":0.0011,"HR":0.0084,"BB":0.099,"K":0.2436,"OUT":0.4421,"GIDP":0.03,"HBP":0.0186,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":200,"avg":0.223,"obp":0.305,"slg":0.325,"k_pct":0.233,"bb_pct":0.083,"hard_hit":0.391,"outcomes":{"1B":0.1723,"2B":0.0128,"3B":0.0238,"HR":0.0139,"BB":0.0825,"K":0.2328,"OUT":0.4095,"GIDP":0.036,"HBP":0.0133,"SF":0.0031},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":83,"avg":0.231,"obp":0.318,"slg":0.349,"k_pct":0.272,"bb_pct":0.087,"hard_hit":0.401,"outcomes":{"1B":0.1545,"2B":0.0426,"3B":0.0252,"HR":0.0085,"BB":0.0868,"K":0.272,"OUT":0.3996,"GIDP":0.0085,"HBP":0.001,"SF":0.0014},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":523,"avg":0.253,"obp":0.326,"slg":0.381,"k_pct":0.225,"bb_pct":0.086,"hard_hit":0.495}},"683002":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":103,"avg":0.274,"obp":0.374,"slg":0.541,"k_pct":0.229,"bb_pct":0.1,"hard_hit":0.313,"outcomes":{"1B":0.1352,"2B":0.0628,"3B":0.0228,"HR":0.053,"BB":0.1,"K":0.2293,"OUT":0.3637,"GIDP":0.0079,"HBP":0.0067,"SF":0.0185},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":149,"avg":0.208,"obp":0.274,"slg":0.403,"k_pct":0.233,"bb_pct":0.066,"hard_hit":0.314,"outcomes":{"1B":0.1168,"2B":0.039,"3B":0.001,"HR":0.0512,"BB":0.0661,"K":0.2334,"OUT":0.4599,"GIDP":0.0305,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":140,"avg":0.226,"obp":0.29,"slg":0.441,"k_pct":0.273,"bb_pct":0.064,"hard_hit":0.474,"outcomes":{"1B":0.1339,"2B":0.0303,"3B":0.001,"HR":0.0609,"BB":0.0644,"K":0.2731,"OUT":0.3867,"GIDP":0.0351,"HBP":0.0134,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":93,"avg":0.183,"obp":0.24,"slg":0.358,"k_pct":0.323,"bb_pct":0.057,"hard_hit":0.45,"outcomes":{"1B":0.1023,"2B":0.0286,"3B":0.0119,"HR":0.0406,"BB":0.0566,"K":0.3234,"OUT":0.3888,"GIDP":0.0046,"HBP":0.0207,"SF":0.0225},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":118,"avg":0.183,"obp":0.297,"slg":0.339,"k_pct":0.278,"bb_pct":0.114,"hard_hit":0.521,"outcomes":{"1B":0.1035,"2B":0.0319,"3B":0.0187,"HR":0.029,"BB":0.1137,"K":0.2782,"OUT":0.3804,"GIDP":0.0321,"HBP":0.001,"SF":0.0115},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":185,"avg":0.227,"obp":0.302,"slg":0.456,"k_pct":0.261,"bb_pct":0.075,"hard_hit":0.427,"outcomes":{"1B":0.1259,"2B":0.0252,"3B":0.0237,"HR":0.0521,"BB":0.075,"K":0.261,"OUT":0.3906,"GIDP":0.0256,"HBP":0.0027,"SF":0.0183},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":179,"avg":0.164,"obp":0.241,"slg":0.297,"k_pct":0.318,"bb_pct":0.076,"hard_hit":0.426,"outcomes":{"1B":0.0976,"2B":0.0246,"3B":0.0187,"HR":0.0235,"BB":0.0763,"K":0.3179,"OUT":0.3819,"GIDP":0.0261,"HBP":0.0127,"SF":0.0208},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":531,"avg":0.233,"obp":0.297,"slg":0.45,"k_pct":0.274,"bb_pct":0.079,"hard_hit":0.515}},"676801":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":143,"avg":0.273,"obp":0.345,"slg":0.446,"k_pct":0.15,"bb_pct":0.072,"hard_hit":0.521,"outcomes":{"1B":0.1856,"2B":0.0433,"3B":0.001,"HR":0.0428,"BB":0.0719,"K":0.1496,"OUT":0.4446,"GIDP":0.0432,"HBP":0.0169,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":172,"avg":0.23,"obp":0.307,"slg":0.342,"k_pct":0.141,"bb_pct":0.077,"hard_hit":0.406,"outcomes":{"1B":0.1607,"2B":0.0393,"3B":0.0183,"HR":0.0119,"BB":0.0768,"K":0.141,"OUT":0.4812,"GIDP":0.0413,"HBP":0.0285,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":127,"avg":0.241,"obp":0.325,"slg":0.375,"k_pct":0.161,"bb_pct":0.084,"hard_hit":0.423,"outcomes":{"1B":0.1738,"2B":0.0317,"3B":0.0054,"HR":0.0305,"BB":0.0835,"K":0.1614,"OUT":0.4625,"GIDP":0.0388,"HBP":0.0011,"SF":0.0113},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":148,"avg":0.213,"obp":0.295,"slg":0.309,"k_pct":0.212,"bb_pct":0.083,"hard_hit":0.547,"outcomes":{"1B":0.1491,"2B":0.0391,"3B":0.0157,"HR":0.0087,"BB":0.0825,"K":0.212,"OUT":0.4646,"GIDP":0.0262,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":126,"avg":0.184,"obp":0.275,"slg":0.265,"k_pct":0.205,"bb_pct":0.091,"hard_hit":0.347,"outcomes":{"1B":0.1338,"2B":0.0269,"3B":0.0141,"HR":0.0088,"BB":0.091,"K":0.2046,"OUT":0.4414,"GIDP":0.0576,"HBP":0.0207,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":153,"avg":0.224,"obp":0.297,"slg":0.386,"k_pct":0.18,"bb_pct":0.073,"hard_hit":0.374,"outcomes":{"1B":0.1421,"2B":0.0418,"3B":0.001,"HR":0.0394,"BB":0.0729,"K":0.1798,"OUT":0.4398,"GIDP":0.0553,"HBP":0.0087,"SF":0.0191},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":99,"avg":0.194,"obp":0.29,"slg":0.279,"k_pct":0.208,"bb_pct":0.096,"hard_hit":0.339,"outcomes":{"1B":0.1414,"2B":0.024,"3B":0.023,"HR":0.0052,"BB":0.096,"K":0.2078,"OUT":0.4395,"GIDP":0.0403,"HBP":0.0113,"SF":0.0116},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":564,"avg":0.248,"obp":0.317,"slg":0.382,"k_pct":0.179,"bb_pct":0.082,"hard_hit":0.54}},"669742":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":155,"avg":0.215,"obp":0.309,"slg":0.426,"k_pct":0.247,"bb_pct":0.095,"hard_hit":0.557,"outcomes":{"1B":0.1146,"2B":0.0404,"3B":0.0074,"HR":0.0522,"BB":0.0948,"K":0.2473,"OUT":0.3952,"GIDP":0.0204,"HBP":0.0266,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":89,"avg":0.225,"obp":0.314,"slg":0.446,"k_pct":0.209,"bb_pct":0.088,"hard_hit":0.341,"outcomes":{"1B":0.1124,"2B":0.0549,"3B":0.0084,"HR":0.0497,"BB":0.0881,"K":0.2087,"OUT":0.4292,"GIDP":0.0465,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":181,"avg":0.194,"obp":0.271,"slg":0.321,"k_pct":0.295,"bb_pct":0.078,"hard_hit":0.463,"outcomes":{"1B":0.1156,"2B":0.0517,"3B":0.003,"HR":0.0232,"BB":0.0777,"K":0.2949,"OUT":0.4286,"GIDP":0.0031,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":175,"avg":0.195,"obp":0.271,"slg":0.349,"k_pct":0.334,"bb_pct":0.075,"hard_hit":0.514,"outcomes":{"1B":0.1057,"2B":0.057,"3B":0.001,"HR":0.0316,"BB":0.0754,"K":0.3341,"OUT":0.3904,"GIDP":0.0028,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":174,"avg":0.165,"obp":0.262,"slg":0.278,"k_pct":0.294,"bb_pct":0.097,"hard_hit":0.384,"outcomes":{"1B":0.1078,"2B":0.0278,"3B":0.0018,"HR":0.0274,"BB":0.097,"K":0.2936,"OUT":0.3952,"GIDP":0.0177,"HBP":0.012,"SF":0.0198},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":176,"avg":0.207,"obp":0.288,"slg":0.432,"k_pct":0.274,"bb_pct":0.082,"hard_hit":0.346,"outcomes":{"1B":0.1084,"2B":0.0233,"3B":0.0222,"HR":0.0527,"BB":0.0818,"K":0.2741,"OUT":0.4041,"GIDP":0.0314,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":93,"avg":0.17,"obp":0.255,"slg":0.33,"k_pct":0.334,"bb_pct":0.085,"hard_hit":0.523,"outcomes":{"1B":0.0981,"2B":0.027,"3B":0.001,"HR":0.0437,"BB":0.0851,"K":0.3335,"OUT":0.3882,"GIDP":0.0183,"HBP":0.0042,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":504,"avg":0.217,"obp":0.288,"slg":0.408,"k_pct":0.284,"bb_pct":0.086,"hard_hit":0.432}},"670541":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":185,"avg":0.261,"obp":0.335,"slg":0.525,"k_pct":0.231,"bb_pct":0.074,"hard_hit":0.557,"outcomes":{"1B":0.1341,"2B":0.0584,"3B":0.0011,"HR":0.0676,"BB":0.0738,"K":0.2309,"OUT":0.3823,"GIDP":0.01,"HBP":0.0216,"SF":0.0202},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":198,"avg":0.206,"obp":0.27,"slg":0.341,"k_pct":0.229,"bb_pct":0.064,"hard_hit":0.375,"outcomes":{"1B":0.1257,"2B":0.0515,"3B":0.001,"HR":0.0274,"BB":0.0642,"K":0.2292,"OUT":0.443,"GIDP":0.0502,"HBP":0.001,"SF":0.0069},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":187,"avg":0.217,"obp":0.312,"slg":0.4,"k_pct":0.297,"bb_pct":0.095,"hard_hit":0.537,"outcomes":{"1B":0.1291,"2B":0.0406,"3B":0.001,"HR":0.0466,"BB":0.0948,"K":0.2973,"OUT":0.384,"GIDP":0.001,"HBP":0.0045,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":150,"avg":0.17,"obp":0.249,"slg":0.319,"k_pct":0.32,"bb_pct":0.079,"hard_hit":0.338,"outcomes":{"1B":0.0983,"2B":0.0247,"3B":0.0173,"HR":0.0299,"BB":0.0785,"K":0.3197,"OUT":0.3702,"GIDP":0.0333,"HBP":0.0272,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":80,"avg":0.148,"obp":0.233,"slg":0.272,"k_pct":0.318,"bb_pct":0.085,"hard_hit":0.374,"outcomes":{"1B":0.0795,"2B":0.0348,"3B":0.0132,"HR":0.0209,"BB":0.0848,"K":0.3183,"OUT":0.4137,"GIDP":0.0139,"HBP":0.02,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":121,"avg":0.226,"obp":0.294,"slg":0.442,"k_pct":0.27,"bb_pct":0.068,"hard_hit":0.526,"outcomes":{"1B":0.1154,"2B":0.0448,"3B":0.0247,"HR":0.0408,"BB":0.068,"K":0.2696,"OUT":0.3956,"GIDP":0.0279,"HBP":0.0111,"SF":0.0023},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":181,"avg":0.174,"obp":0.258,"slg":0.309,"k_pct":0.313,"bb_pct":0.084,"hard_hit":0.513,"outcomes":{"1B":0.1157,"2B":0.019,"3B":0.001,"HR":0.0381,"BB":0.0839,"K":0.3132,"OUT":0.3677,"GIDP":0.0355,"HBP":0.0032,"SF":0.0228},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":458,"avg":0.222,"obp":0.291,"slg":0.414,"k_pct":0.283,"bb_pct":0.078,"hard_hit":0.449}},"663728":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":163,"avg":0.238,"obp":0.342,"slg":0.513,"k_pct":0.236,"bb_pct":0.104,"hard_hit":0.552,"outcomes":{"1B":0.1107,"2B":0.0497,"3B":0.0085,"HR":0.0693,"BB":0.1042,"K":0.2359,"OUT":0.3783,"GIDP":0.0231,"HBP":0.0188,"SF":0.0014},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":160,"avg":0.211,"obp":0.278,"slg":0.411,"k_pct":0.204,"bb_pct":0.066,"hard_hit":0.487,"outcomes":{"1B":0.1036,"2B":0.0616,"3B":0.001,"HR":0.0452,"BB":0.0663,"K":0.2045,"OUT":0.4358,"GIDP":0.0473,"HBP":0.0114,"SF":0.0233},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":161,"avg":0.196,"obp":0.28,"slg":0.319,"k_pct":0.292,"bb_pct":0.084,"hard_hit":0.483,"outcomes":{"1B":0.1183,"2B":0.054,"3B":0.001,"HR":0.0224,"BB":0.0838,"K":0.2918,"OUT":0.3931,"GIDP":0.0294,"HBP":0.0053,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":167,"avg":0.139,"obp":0.211,"slg":0.21,"k_pct":0.343,"bb_pct":0.071,"hard_hit":0.506,"outcomes":{"1B":0.0953,"2B":0.0302,"3B":0.0011,"HR":0.0127,"BB":0.0714,"K":0.3428,"OUT":0.4246,"GIDP":0.0195,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":81,"avg":0.155,"obp":0.25,"slg":0.333,"k_pct":0.333,"bb_pct":0.094,"hard_hit":0.534,"outcomes":{"1B":0.0809,"2B":0.0139,"3B":0.0188,"HR":0.0419,"BB":0.0944,"K":0.3332,"OUT":0.3955,"GIDP":0.0194,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":118,"avg":0.179,"obp":0.277,"slg":0.291,"k_pct":0.279,"bb_pct":0.098,"hard_hit":0.352,"outcomes":{"1B":0.1185,"2B":0.0315,"3B":0.0059,"HR":0.0229,"BB":0.0978,"K":0.2793,"OUT":0.3817,"GIDP":0.0435,"HBP":0.0166,"SF":0.0023},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":152,"avg":0.15,"obp":0.241,"slg":0.263,"k_pct":0.342,"bb_pct":0.091,"hard_hit":0.525,"outcomes":{"1B":0.0933,"2B":0.0287,"3B":0.001,"HR":0.0273,"BB":0.0909,"K":0.342,"OUT":0.3636,"GIDP":0.0383,"HBP":0.014,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":432,"avg":0.202,"obp":0.278,"slg":0.371,"k_pct":0.29,"bb_pct":0.087,"hard_hit":0.532}},"675911":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":178,"avg":0.31,"obp":0.379,"slg":0.527,"k_pct":0.161,"bb_pct":0.069,"hard_hit":0.471,"outcomes":{"1B":0.1886,"2B":0.0629,"3B":0.023,"HR":0.0358,"BB":0.0688,"K":0.1611,"OUT":0.4162,"GIDP":0.0274,"HBP":0.001,"SF":0.0151},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":175,"avg":0.279,"obp":0.331,"slg":0.447,"k_pct":0.125,"bb_pct":0.051,"hard_hit":0.408,"outcomes":{"1B":0.1801,"2B":0.0541,"3B":0.0217,"HR":0.0234,"BB":0.0514,"K":0.1252,"OUT":0.4741,"GIDP":0.068,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":117,"avg":0.233,"obp":0.313,"slg":0.37,"k_pct":0.16,"bb_pct":0.08,"hard_hit":0.494,"outcomes":{"1B":0.1469,"2B":0.0511,"3B":0.0209,"HR":0.0145,"BB":0.0795,"K":0.1597,"OUT":0.4233,"GIDP":0.0561,"HBP":0.0256,"SF":0.0225},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":126,"avg":0.173,"obp":0.257,"slg":0.243,"k_pct":0.212,"bb_pct":0.084,"hard_hit":0.323,"outcomes":{"1B":0.1264,"2B":0.0233,"3B":0.0223,"HR":0.0009,"BB":0.0839,"K":0.2123,"OUT":0.4343,"GIDP":0.056,"HBP":0.0253,"SF":0.0153},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":140,"avg":0.176,"obp":0.28,"slg":0.249,"k_pct":0.197,"bb_pct":0.104,"hard_hit":0.307,"outcomes":{"1B":0.1303,"2B":0.0317,"3B":0.001,"HR":0.0132,"BB":0.1036,"K":0.1974,"OUT":0.4613,"GIDP":0.0472,"HBP":0.003,"SF":0.0114},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":84,"avg":0.251,"obp":0.304,"slg":0.365,"k_pct":0.185,"bb_pct":0.053,"hard_hit":0.379,"outcomes":{"1B":0.1774,"2B":0.0429,"3B":0.0219,"HR":0.009,"BB":0.0531,"K":0.1851,"OUT":0.4718,"GIDP":0.0325,"HBP":0.0054,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":99,"avg":0.171,"obp":0.248,"slg":0.227,"k_pct":0.224,"bb_pct":0.077,"hard_hit":0.53,"outcomes":{"1B":0.1376,"2B":0.0137,"3B":0.0192,"HR":0.001,"BB":0.077,"K":0.2235,"OUT":0.4529,"GIDP":0.057,"HBP":0.0047,"SF":0.0135},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":445,"avg":0.252,"obp":0.311,"slg":0.383,"k_pct":0.181,"bb_pct":0.074,"hard_hit":0.517}},"665742":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":195,"avg":0.29,"obp":0.359,"slg":0.46,"k_pct":0.15,"bb_pct":0.07,"hard_hit":0.554,"outcomes":{"1B":0.1872,"2B":0.0685,"3B":0.001,"HR":0.0331,"BB":0.0696,"K":0.1498,"OUT":0.4252,"GIDP":0.035,"HBP":0.0296,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":180,"avg":0.218,"obp":0.293,"slg":0.275,"k_pct":0.13,"bb_pct":0.075,"hard_hit":0.387,"outcomes":{"1B":0.1671,"2B":0.0467,"3B":0.001,"HR":0.0029,"BB":0.0752,"K":0.1304,"OUT":0.4948,"GIDP":0.0668,"HBP":0.0141,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":156,"avg":0.256,"obp":0.335,"slg":0.403,"k_pct":0.167,"bb_pct":0.079,"hard_hit":0.301,"outcomes":{"1B":0.1731,"2B":0.0496,"3B":0.001,"HR":0.032,"BB":0.0792,"K":0.1672,"OUT":0.4363,"GIDP":0.0283,"HBP":0.0183,"SF":0.015},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":121,"avg":0.2,"obp":0.261,"slg":0.246,"k_pct":0.232,"bb_pct":0.061,"hard_hit":0.304,"outcomes":{"1B":0.1656,"2B":0.0277,"3B":0.0011,"HR":0.0054,"BB":0.0612,"K":0.2323,"OUT":0.4626,"GIDP":0.0221,"HBP":0.021,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":158,"avg":0.164,"obp":0.243,"slg":0.204,"k_pct":0.216,"bb_pct":0.079,"hard_hit":0.311,"outcomes":{"1B":0.1317,"2B":0.0274,"3B":0.002,"HR":0.0028,"BB":0.0792,"K":0.2161,"OUT":0.4853,"GIDP":0.0478,"HBP":0.0066,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":196,"avg":0.251,"obp":0.34,"slg":0.373,"k_pct":0.153,"bb_pct":0.089,"hard_hit":0.415,"outcomes":{"1B":0.1719,"2B":0.0549,"3B":0.0059,"HR":0.0184,"BB":0.0889,"K":0.153,"OUT":0.4508,"GIDP":0.0362,"HBP":0.0165,"SF":0.0036},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":144,"avg":0.182,"obp":0.267,"slg":0.21,"k_pct":0.224,"bb_pct":0.085,"hard_hit":0.457,"outcomes":{"1B":0.1566,"2B":0.023,"3B":0.001,"HR":0.001,"BB":0.0853,"K":0.2243,"OUT":0.4604,"GIDP":0.0354,"HBP":0.0119,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":445,"avg":0.247,"obp":0.317,"slg":0.344,"k_pct":0.182,"bb_pct":0.077,"hard_hit":0.509}},"608036":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":173,"avg":0.265,"obp":0.358,"slg":0.444,"k_pct":0.145,"bb_pct":0.093,"hard_hit":0.325,"outcomes":{"1B":0.1617,"2B":0.0552,"3B":0.0217,"HR":0.0266,"BB":0.093,"K":0.1446,"OUT":0.4377,"GIDP":0.0359,"HBP":0.0227,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":183,"avg":0.236,"obp":0.315,"slg":0.308,"k_pct":0.116,"bb_pct":0.079,"hard_hit":0.334,"outcomes":{"1B":0.1721,"2B":0.0583,"3B":0.001,"HR":0.0042,"BB":0.0792,"K":0.1161,"OUT":0.508,"GIDP":0.045,"HBP":0.001,"SF":0.015},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":116,"avg":0.232,"obp":0.307,"slg":0.385,"k_pct":0.182,"bb_pct":0.075,"hard_hit":0.456,"outcomes":{"1B":0.1399,"2B":0.0573,"3B":0.0083,"HR":0.0263,"BB":0.0751,"K":0.1818,"OUT":0.4498,"GIDP":0.0363,"HBP":0.0242,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":183,"avg":0.204,"obp":0.265,"slg":0.316,"k_pct":0.199,"bb_pct":0.06,"hard_hit":0.412,"outcomes":{"1B":0.1373,"2B":0.0441,"3B":0.001,"HR":0.0218,"BB":0.0604,"K":0.199,"OUT":0.4749,"GIDP":0.0355,"HBP":0.0189,"SF":0.0071},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":177,"avg":0.214,"obp":0.304,"slg":0.356,"k_pct":0.2,"bb_pct":0.09,"hard_hit":0.38,"outcomes":{"1B":0.1298,"2B":0.0497,"3B":0.0097,"HR":0.0245,"BB":0.0904,"K":0.2002,"OUT":0.4471,"GIDP":0.0468,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":133,"avg":0.231,"obp":0.302,"slg":0.368,"k_pct":0.167,"bb_pct":0.071,"hard_hit":0.418,"outcomes":{"1B":0.1644,"2B":0.0217,"3B":0.0212,"HR":0.0242,"BB":0.0707,"K":0.1666,"OUT":0.4873,"GIDP":0.0227,"HBP":0.0202,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":136,"avg":0.184,"obp":0.269,"slg":0.308,"k_pct":0.238,"bb_pct":0.085,"hard_hit":0.472,"outcomes":{"1B":0.1276,"2B":0.0227,"3B":0.001,"HR":0.033,"BB":0.0847,"K":0.2377,"OUT":0.4406,"GIDP":0.0507,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":544,"avg":0.247,"obp":0.315,"slg":0.392,"k_pct":0.178,"bb_pct":0.079,"hard_hit":0.471}},"605141":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":156,"avg":0.223,"obp":0.355,"slg":0.356,"k_pct":0.199,"bb_pct":0.132,"hard_hit":0.314,"outcomes":{"1B":0.1557,"2B":0.0304,"3B":0.0058,"HR":0.0306,"BB":0.1322,"K":0.1988,"OUT":0.4077,"GIDP":0.033,"HBP":0.0046,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":109,"avg":0.234,"obp":0.339,"slg":0.435,"k_pct":0.15,"bb_pct":0.105,"hard_hit":0.43,"outcomes":{"1B":0.1222,"2B":0.0598,"3B":0.0152,"HR":0.0368,"BB":0.105,"K":0.1497,"OUT":0.4549,"GIDP":0.0488,"HBP":0.001,"SF":0.0065},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":170,"avg":0.236,"obp":0.336,"slg":0.415,"k_pct":0.188,"bb_pct":0.1,"hard_hit":0.466,"outcomes":{"1B":0.1415,"2B":0.0516,"3B":0.001,"HR":0.0419,"BB":0.1004,"K":0.1883,"OUT":0.4116,"GIDP":0.0439,"HBP":0.0129,"SF":0.0068},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":135,"avg":0.17,"obp":0.318,"slg":0.278,"k_pct":0.259,"bb_pct":0.148,"hard_hit":0.453,"outcomes":{"1B":0.102,"2B":0.0363,"3B":0.0227,"HR":0.0089,"BB":0.1485,"K":0.2594,"OUT":0.3891,"GIDP":0.0246,"HBP":0.0075,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":124,"avg":0.164,"obp":0.315,"slg":0.252,"k_pct":0.238,"bb_pct":0.15,"hard_hit":0.391,"outcomes":{"1B":0.1165,"2B":0.0271,"3B":0.0011,"HR":0.0195,"BB":0.1505,"K":0.2381,"OUT":0.3996,"GIDP":0.0153,"HBP":0.0109,"SF":0.0213},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":160,"avg":0.225,"obp":0.35,"slg":0.313,"k_pct":0.194,"bb_pct":0.125,"hard_hit":0.428,"outcomes":{"1B":0.1642,"2B":0.0475,"3B":0.001,"HR":0.0126,"BB":0.1247,"K":0.1939,"OUT":0.3902,"GIDP":0.0419,"HBP":0.001,"SF":0.0229},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":88,"avg":0.185,"obp":0.318,"slg":0.328,"k_pct":0.266,"bb_pct":0.133,"hard_hit":0.422,"outcomes":{"1B":0.1121,"2B":0.0377,"3B":0.0009,"HR":0.0345,"BB":0.133,"K":0.2662,"OUT":0.3591,"GIDP":0.0416,"HBP":0.0141,"SF":0.0009},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":497,"avg":0.24,"obp":0.341,"slg":0.397,"k_pct":0.213,"bb_pct":0.128,"hard_hit":0.509}},"671096":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":156,"avg":0.264,"obp":0.328,"slg":0.386,"k_pct":0.151,"bb_pct":0.064,"hard_hit":0.432,"outcomes":{"1B":0.1921,"2B":0.0461,"3B":0.001,"HR":0.0246,"BB":0.0643,"K":0.1514,"OUT":0.441,"GIDP":0.0479,"HBP":0.0304,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":87,"avg":0.267,"obp":0.323,"slg":0.452,"k_pct":0.139,"bb_pct":0.057,"hard_hit":0.417,"outcomes":{"1B":0.165,"2B":0.0511,"3B":0.0173,"HR":0.0331,"BB":0.0568,"K":0.1394,"OUT":0.4758,"GIDP":0.0517,"HBP":0.0088,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":126,"avg":0.25,"obp":0.335,"slg":0.363,"k_pct":0.149,"bb_pct":0.084,"hard_hit":0.397,"outcomes":{"1B":0.1695,"2B":0.0526,"3B":0.0249,"HR":0.0033,"BB":0.0844,"K":0.149,"OUT":0.4407,"GIDP":0.0586,"HBP":0.0088,"SF":0.0082},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":172,"avg":0.196,"obp":0.281,"slg":0.295,"k_pct":0.226,"bb_pct":0.085,"hard_hit":0.521,"outcomes":{"1B":0.1371,"2B":0.038,"3B":0.001,"HR":0.0198,"BB":0.0852,"K":0.2255,"OUT":0.4518,"GIDP":0.0248,"HBP":0.0158,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":170,"avg":0.193,"obp":0.288,"slg":0.242,"k_pct":0.214,"bb_pct":0.095,"hard_hit":0.544,"outcomes":{"1B":0.1468,"2B":0.0436,"3B":0.001,"HR":0.0012,"BB":0.0954,"K":0.214,"OUT":0.437,"GIDP":0.0457,"HBP":0.0143,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":134,"avg":0.231,"obp":0.306,"slg":0.394,"k_pct":0.179,"bb_pct":0.075,"hard_hit":0.432,"outcomes":{"1B":0.1489,"2B":0.0343,"3B":0.0163,"HR":0.0318,"BB":0.075,"K":0.179,"OUT":0.449,"GIDP":0.0463,"HBP":0.0098,"SF":0.0096},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":144,"avg":0.177,"obp":0.269,"slg":0.27,"k_pct":0.211,"bb_pct":0.092,"hard_hit":0.5,"outcomes":{"1B":0.1226,"2B":0.0227,"3B":0.0224,"HR":0.0088,"BB":0.092,"K":0.2109,"OUT":0.4772,"GIDP":0.0266,"HBP":0.001,"SF":0.0158},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":554,"avg":0.25,"obp":0.317,"slg":0.38,"k_pct":0.181,"bb_pct":0.079,"hard_hit":0.358}},"668709":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":132,"avg":0.263,"obp":0.332,"slg":0.371,"k_pct":0.212,"bb_pct":0.069,"hard_hit":0.395,"outcomes":{"1B":0.1914,"2B":0.0528,"3B":0.001,"HR":0.0178,"BB":0.0694,"K":0.212,"OUT":0.4181,"GIDP":0.0338,"HBP":0.001,"SF":0.0026},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":104,"avg":0.278,"obp":0.346,"slg":0.438,"k_pct":0.143,"bb_pct":0.069,"hard_hit":0.396,"outcomes":{"1B":0.1813,"2B":0.0564,"3B":0.0158,"HR":0.0241,"BB":0.0685,"K":0.1434,"OUT":0.422,"GIDP":0.0467,"HBP":0.0215,"SF":0.0203},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":112,"avg":0.249,"obp":0.322,"slg":0.34,"k_pct":0.206,"bb_pct":0.073,"hard_hit":0.314,"outcomes":{"1B":0.1832,"2B":0.0481,"3B":0.0083,"HR":0.009,"BB":0.0734,"K":0.2058,"OUT":0.4179,"GIDP":0.0319,"HBP":0.0215,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":186,"avg":0.234,"obp":0.308,"slg":0.384,"k_pct":0.258,"bb_pct":0.074,"hard_hit":0.414,"outcomes":{"1B":0.1573,"2B":0.0262,"3B":0.0278,"HR":0.0226,"BB":0.0744,"K":0.2582,"OUT":0.4146,"GIDP":0.0068,"HBP":0.0073,"SF":0.0048},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":83,"avg":0.203,"obp":0.278,"slg":0.264,"k_pct":0.235,"bb_pct":0.075,"hard_hit":0.383,"outcomes":{"1B":0.1672,"2B":0.02,"3B":0.0064,"HR":0.0095,"BB":0.0753,"K":0.2352,"OUT":0.4449,"GIDP":0.01,"HBP":0.0305,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":158,"avg":0.21,"obp":0.264,"slg":0.269,"k_pct":0.238,"bb_pct":0.054,"hard_hit":0.301,"outcomes":{"1B":0.1615,"2B":0.0405,"3B":0.0036,"HR":0.004,"BB":0.0541,"K":0.2378,"OUT":0.4394,"GIDP":0.0349,"HBP":0.0214,"SF":0.0029},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":133,"avg":0.195,"obp":0.287,"slg":0.303,"k_pct":0.291,"bb_pct":0.092,"hard_hit":0.466,"outcomes":{"1B":0.1377,"2B":0.0209,"3B":0.0221,"HR":0.0144,"BB":0.0921,"K":0.2907,"OUT":0.4079,"GIDP":0.0119,"HBP":0.0011,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":579,"avg":0.257,"obp":0.32,"slg":0.373,"k_pct":0.226,"bb_pct":0.072,"hard_hit":0.441}},"624577":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":133,"avg":0.264,"obp":0.35,"slg":0.376,"k_pct":0.149,"bb_pct":0.086,"hard_hit":0.349,"outcomes":{"1B":0.1757,"2B":0.0707,"3B":0.0116,"HR":0.006,"BB":0.0861,"K":0.1492,"OUT":0.4442,"GIDP":0.0397,"HBP":0.0156,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":129,"avg":0.261,"obp":0.322,"slg":0.42,"k_pct":0.139,"bb_pct":0.061,"hard_hit":0.555,"outcomes":{"1B":0.1741,"2B":0.0502,"3B":0.001,"HR":0.0356,"BB":0.0608,"K":0.1394,"OUT":0.4732,"GIDP":0.0402,"HBP":0.0246,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":149,"avg":0.209,"obp":0.301,"slg":0.309,"k_pct":0.181,"bb_pct":0.092,"hard_hit":0.388,"outcomes":{"1B":0.1549,"2B":0.0213,"3B":0.0181,"HR":0.0142,"BB":0.0922,"K":0.1807,"OUT":0.4652,"GIDP":0.051,"HBP":0.0013,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":105,"avg":0.24,"obp":0.308,"slg":0.417,"k_pct":0.193,"bb_pct":0.068,"hard_hit":0.311,"outcomes":{"1B":0.1425,"2B":0.052,"3B":0.0121,"HR":0.0335,"BB":0.0676,"K":0.1929,"OUT":0.4257,"GIDP":0.0476,"HBP":0.0252,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":179,"avg":0.183,"obp":0.295,"slg":0.308,"k_pct":0.205,"bb_pct":0.111,"hard_hit":0.312,"outcomes":{"1B":0.1199,"2B":0.022,"3B":0.0227,"HR":0.0189,"BB":0.1113,"K":0.205,"OUT":0.4472,"GIDP":0.0509,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":127,"avg":0.236,"obp":0.304,"slg":0.356,"k_pct":0.171,"bb_pct":0.067,"hard_hit":0.54,"outcomes":{"1B":0.1697,"2B":0.0316,"3B":0.0173,"HR":0.0178,"BB":0.0674,"K":0.1711,"OUT":0.478,"GIDP":0.0343,"HBP":0.001,"SF":0.0119},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":119,"avg":0.195,"obp":0.278,"slg":0.266,"k_pct":0.231,"bb_pct":0.083,"hard_hit":0.416,"outcomes":{"1B":0.1394,"2B":0.0416,"3B":0.013,"HR":0.001,"BB":0.0833,"K":0.2306,"OUT":0.4473,"GIDP":0.0325,"HBP":0.001,"SF":0.0103},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":529,"avg":0.251,"obp":0.318,"slg":0.387,"k_pct":0.181,"bb_pct":0.081,"hard_hit":0.383}},"671217":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":131,"avg":0.254,"obp":0.346,"slg":0.536,"k_pct":0.231,"bb_pct":0.092,"hard_hit":0.394,"outcomes":{"1B":0.1242,"2B":0.0466,"3B":0.0137,"HR":0.0695,"BB":0.092,"K":0.2309,"OUT":0.375,"GIDP":0.0357,"HBP":0.001,"SF":0.0115},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":129,"avg":0.235,"obp":0.309,"slg":0.412,"k_pct":0.229,"bb_pct":0.074,"hard_hit":0.547,"outcomes":{"1B":0.1309,"2B":0.0567,"3B":0.0219,"HR":0.0255,"BB":0.0737,"K":0.2292,"OUT":0.4177,"GIDP":0.0225,"HBP":0.021,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":94,"avg":0.176,"obp":0.265,"slg":0.329,"k_pct":0.3,"bb_pct":0.089,"hard_hit":0.307,"outcomes":{"1B":0.1041,"2B":0.0298,"3B":0.0023,"HR":0.0397,"BB":0.0886,"K":0.2999,"OUT":0.4166,"GIDP":0.0167,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":105,"avg":0.163,"obp":0.243,"slg":0.288,"k_pct":0.326,"bb_pct":0.081,"hard_hit":0.332,"outcomes":{"1B":0.087,"2B":0.0405,"3B":0.0204,"HR":0.0146,"BB":0.0806,"K":0.3264,"OUT":0.3666,"GIDP":0.0243,"HBP":0.0157,"SF":0.0238},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":149,"avg":0.185,"obp":0.269,"slg":0.35,"k_pct":0.309,"bb_pct":0.084,"hard_hit":0.375,"outcomes":{"1B":0.1047,"2B":0.0282,"3B":0.0191,"HR":0.033,"BB":0.084,"K":0.3091,"OUT":0.4062,"GIDP":0.0129,"HBP":0.0019,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":143,"avg":0.206,"obp":0.275,"slg":0.408,"k_pct":0.264,"bb_pct":0.069,"hard_hit":0.307,"outcomes":{"1B":0.116,"2B":0.0272,"3B":0.0128,"HR":0.0497,"BB":0.0694,"K":0.2636,"OUT":0.3926,"GIDP":0.046,"HBP":0.0214,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":178,"avg":0.167,"obp":0.261,"slg":0.302,"k_pct":0.31,"bb_pct":0.093,"hard_hit":0.406,"outcomes":{"1B":0.101,"2B":0.0245,"3B":0.015,"HR":0.0268,"BB":0.0934,"K":0.31,"OUT":0.3682,"GIDP":0.0395,"HBP":0.0166,"SF":0.005},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":567,"avg":0.22,"obp":0.292,"slg":0.417,"k_pct":0.281,"bb_pct":0.083,"hard_hit":0.365}},"683737":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":135,"avg":0.287,"obp":0.359,"slg":0.437,"k_pct":0.2,"bb_pct":0.072,"hard_hit":0.431,"outcomes":{"1B":0.204,"2B":0.0446,"3B":0.0098,"HR":0.0285,"BB":0.072,"K":0.2003,"OUT":0.3918,"GIDP":0.025,"HBP":0.001,"SF":0.0231},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":90,"avg":0.27,"obp":0.317,"slg":0.371,"k_pct":0.179,"bb_pct":0.047,"hard_hit":0.365,"outcomes":{"1B":0.1964,"2B":0.0537,"3B":0.0128,"HR":0.0072,"BB":0.0469,"K":0.1789,"OUT":0.4428,"GIDP":0.0483,"HBP":0.0119,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":172,"avg":0.229,"obp":0.314,"slg":0.296,"k_pct":0.22,"bb_pct":0.085,"hard_hit":0.535,"outcomes":{"1B":0.1835,"2B":0.0335,"3B":0.001,"HR":0.0106,"BB":0.0851,"K":0.2198,"OUT":0.4151,"GIDP":0.0394,"HBP":0.001,"SF":0.0108},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":159,"avg":0.221,"obp":0.275,"slg":0.354,"k_pct":0.281,"bb_pct":0.054,"hard_hit":0.466,"outcomes":{"1B":0.145,"2B":0.0475,"3B":0.001,"HR":0.0278,"BB":0.0538,"K":0.2809,"OUT":0.4253,"GIDP":0.0107,"HBP":0.001,"SF":0.007},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":136,"avg":0.211,"obp":0.301,"slg":0.349,"k_pct":0.254,"bb_pct":0.09,"hard_hit":0.408,"outcomes":{"1B":0.141,"2B":0.0354,"3B":0.001,"HR":0.0335,"BB":0.09,"K":0.2542,"OUT":0.4308,"GIDP":0.012,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":93,"avg":0.232,"obp":0.296,"slg":0.359,"k_pct":0.236,"bb_pct":0.065,"hard_hit":0.383,"outcomes":{"1B":0.1733,"2B":0.0243,"3B":0.001,"HR":0.0334,"BB":0.0645,"K":0.236,"OUT":0.4254,"GIDP":0.0164,"HBP":0.021,"SF":0.0047},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":121,"avg":0.177,"obp":0.251,"slg":0.204,"k_pct":0.285,"bb_pct":0.074,"hard_hit":0.543,"outcomes":{"1B":0.1537,"2B":0.0214,"3B":0.001,"HR":0.001,"BB":0.074,"K":0.2846,"OUT":0.4285,"GIDP":0.0103,"HBP":0.0244,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":500,"avg":0.254,"obp":0.311,"slg":0.37,"k_pct":0.236,"bb_pct":0.07,"hard_hit":0.388}},"680757":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":86,"avg":0.291,"obp":0.374,"slg":0.5,"k_pct":0.138,"bb_pct":0.083,"hard_hit":0.313,"outcomes":{"1B":0.1717,"2B":0.0721,"3B":0.0059,"HR":0.0415,"BB":0.0825,"K":0.1379,"OUT":0.4394,"GIDP":0.0395,"HBP":0.001,"SF":0.0086},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":126,"avg":0.25,"obp":0.308,"slg":0.382,"k_pct":0.136,"bb_pct":0.058,"hard_hit":0.312,"outcomes":{"1B":0.1607,"2B":0.0618,"3B":0.0115,"HR":0.0159,"BB":0.0582,"K":0.1362,"OUT":0.4517,"GIDP":0.0713,"HBP":0.0181,"SF":0.0147},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":96,"avg":0.206,"obp":0.285,"slg":0.289,"k_pct":0.176,"bb_pct":0.079,"hard_hit":0.554,"outcomes":{"1B":0.1484,"2B":0.0444,"3B":0.001,"HR":0.0121,"BB":0.0789,"K":0.1756,"OUT":0.4619,"GIDP":0.0554,"HBP":0.0135,"SF":0.0088},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":122,"avg":0.223,"obp":0.304,"slg":0.376,"k_pct":0.2,"bb_pct":0.081,"hard_hit":0.509,"outcomes":{"1B":0.1369,"2B":0.0522,"3B":0.001,"HR":0.0328,"BB":0.0809,"K":0.1996,"OUT":0.4542,"GIDP":0.0403,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":144,"avg":0.181,"obp":0.288,"slg":0.259,"k_pct":0.193,"bb_pct":0.107,"hard_hit":0.515,"outcomes":{"1B":0.1307,"2B":0.0259,"3B":0.0207,"HR":0.0036,"BB":0.1072,"K":0.1926,"OUT":0.4453,"GIDP":0.0446,"HBP":0.0217,"SF":0.0077},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":168,"avg":0.236,"obp":0.299,"slg":0.38,"k_pct":0.172,"bb_pct":0.063,"hard_hit":0.464,"outcomes":{"1B":0.1564,"2B":0.0469,"3B":0.001,"HR":0.0316,"BB":0.0628,"K":0.1716,"OUT":0.4549,"GIDP":0.042,"HBP":0.0202,"SF":0.0126},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":179,"avg":0.21,"obp":0.293,"slg":0.354,"k_pct":0.21,"bb_pct":0.084,"hard_hit":0.519,"outcomes":{"1B":0.1448,"2B":0.0207,"3B":0.0103,"HR":0.0341,"BB":0.0836,"K":0.2104,"OUT":0.4347,"GIDP":0.0395,"HBP":0.009,"SF":0.0129},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":457,"avg":0.254,"obp":0.319,"slg":0.403,"k_pct":0.175,"bb_pct":0.079,"hard_hit":0.514}},"686668":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":140,"avg":0.271,"obp":0.354,"slg":0.391,"k_pct":0.2,"bb_pct":0.083,"hard_hit":0.527,"outcomes":{"1B":0.1928,"2B":0.046,"3B":0.0215,"HR":0.0103,"BB":0.0833,"K":0.2004,"OUT":0.4148,"GIDP":0.0088,"HBP":0.0119,"SF":0.0102},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":123,"avg":0.232,"obp":0.289,"slg":0.269,"k_pct":0.179,"bb_pct":0.057,"hard_hit":0.442,"outcomes":{"1B":0.2033,"2B":0.0241,"3B":0.0011,"HR":0.0035,"BB":0.0569,"K":0.1787,"OUT":0.484,"GIDP":0.0242,"HBP":0.0011,"SF":0.0231},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":118,"avg":0.266,"obp":0.336,"slg":0.433,"k_pct":0.207,"bb_pct":0.07,"hard_hit":0.501,"outcomes":{"1B":0.1749,"2B":0.0442,"3B":0.017,"HR":0.0298,"BB":0.0697,"K":0.2069,"OUT":0.4232,"GIDP":0.011,"HBP":0.0019,"SF":0.0214},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":194,"avg":0.213,"obp":0.285,"slg":0.303,"k_pct":0.273,"bb_pct":0.071,"hard_hit":0.555,"outcomes":{"1B":0.156,"2B":0.0371,"3B":0.0084,"HR":0.012,"BB":0.0714,"K":0.2734,"OUT":0.4129,"GIDP":0.0113,"HBP":0.0118,"SF":0.0056},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":105,"avg":0.229,"obp":0.311,"slg":0.338,"k_pct":0.25,"bb_pct":0.082,"hard_hit":0.515,"outcomes":{"1B":0.1537,"2B":0.0485,"3B":0.0203,"HR":0.0067,"BB":0.082,"K":0.2502,"OUT":0.4166,"GIDP":0.0178,"HBP":0.001,"SF":0.0032},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":92,"avg":0.215,"obp":0.302,"slg":0.26,"k_pct":0.218,"bb_pct":0.087,"hard_hit":0.407,"outcomes":{"1B":0.1756,"2B":0.0355,"3B":0.0011,"HR":0.0026,"BB":0.0869,"K":0.2178,"OUT":0.4388,"GIDP":0.0395,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":105,"avg":0.185,"obp":0.263,"slg":0.237,"k_pct":0.285,"bb_pct":0.079,"hard_hit":0.497,"outcomes":{"1B":0.1522,"2B":0.0134,"3B":0.0181,"HR":0.001,"BB":0.0787,"K":0.285,"OUT":0.3897,"GIDP":0.0359,"HBP":0.0231,"SF":0.003},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":493,"avg":0.253,"obp":0.313,"slg":0.351,"k_pct":0.23,"bb_pct":0.076,"hard_hit":0.414}},"642715":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":102,"avg":0.24,"obp":0.375,"slg":0.405,"k_pct":0.18,"bb_pct":0.135,"hard_hit":0.543,"outcomes":{"1B":0.1489,"2B":0.0538,"3B":0.001,"HR":0.0363,"BB":0.1351,"K":0.1805,"OUT":0.3797,"GIDP":0.0445,"HBP":0.001,"SF":0.0194},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":198,"avg":0.2,"obp":0.325,"slg":0.326,"k_pct":0.181,"bb_pct":0.124,"hard_hit":0.556,"outcomes":{"1B":0.1156,"2B":0.0555,"3B":0.0161,"HR":0.0129,"BB":0.1245,"K":0.1815,"OUT":0.4478,"GIDP":0.0327,"HBP":0.0041,"SF":0.0095},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":138,"avg":0.216,"obp":0.354,"slg":0.371,"k_pct":0.225,"bb_pct":0.138,"hard_hit":0.469,"outcomes":{"1B":0.1221,"2B":0.0599,"3B":0.0058,"HR":0.0279,"BB":0.1383,"K":0.2253,"OUT":0.4009,"GIDP":0.0178,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":121,"avg":0.16,"obp":0.301,"slg":0.226,"k_pct":0.256,"bb_pct":0.142,"hard_hit":0.323,"outcomes":{"1B":0.1229,"2B":0.0213,"3B":0.001,"HR":0.0143,"BB":0.1418,"K":0.2564,"OUT":0.3979,"GIDP":0.0368,"HBP":0.0064,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":172,"avg":0.159,"obp":0.304,"slg":0.235,"k_pct":0.239,"bb_pct":0.145,"hard_hit":0.449,"outcomes":{"1B":0.1214,"2B":0.0181,"3B":0.001,"HR":0.0186,"BB":0.1454,"K":0.2395,"OUT":0.3839,"GIDP":0.0417,"HBP":0.0293,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":168,"avg":0.201,"obp":0.329,"slg":0.341,"k_pct":0.186,"bb_pct":0.129,"hard_hit":0.331,"outcomes":{"1B":0.1304,"2B":0.0344,"3B":0.001,"HR":0.0347,"BB":0.1286,"K":0.1863,"OUT":0.3974,"GIDP":0.0469,"HBP":0.0255,"SF":0.0148},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":140,"avg":0.166,"obp":0.292,"slg":0.229,"k_pct":0.268,"bb_pct":0.126,"hard_hit":0.497,"outcomes":{"1B":0.1275,"2B":0.022,"3B":0.0076,"HR":0.0088,"BB":0.1262,"K":0.268,"OUT":0.3927,"GIDP":0.0345,"HBP":0.0067,"SF":0.006},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":475,"avg":0.226,"obp":0.337,"slg":0.36,"k_pct":0.22,"bb_pct":0.134,"hard_hit":0.502}},"664285":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":105,"avg":0.254,"obp":0.341,"slg":0.499,"k_pct":0.226,"bb_pct":0.088,"hard_hit":0.449,"outcomes":{"1B":0.132,"2B":0.0518,"3B":0.0159,"HR":0.0539,"BB":0.0877,"K":0.2255,"OUT":0.3816,"GIDP":0.0091,"HBP":0.0223,"SF":0.0203},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":145,"avg":0.188,"obp":0.249,"slg":0.322,"k_pct":0.235,"bb_pct":0.061,"hard_hit":0.408,"outcomes":{"1B":0.1116,"2B":0.0454,"3B":0.0051,"HR":0.026,"BB":0.0613,"K":0.2352,"OUT":0.4461,"GIDP":0.0426,"HBP":0.0235,"SF":0.0033},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":169,"avg":0.22,"obp":0.288,"slg":0.399,"k_pct":0.3,"bb_pct":0.068,"hard_hit":0.317,"outcomes":{"1B":0.1251,"2B":0.0471,"3B":0.0121,"HR":0.0359,"BB":0.0676,"K":0.3002,"OUT":0.4001,"GIDP":0.0097,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":133,"avg":0.215,"obp":0.263,"slg":0.406,"k_pct":0.301,"bb_pct":0.049,"hard_hit":0.397,"outcomes":{"1B":0.1139,"2B":0.0546,"3B":0.001,"HR":0.045,"BB":0.0488,"K":0.3009,"OUT":0.3716,"GIDP":0.0291,"HBP":0.0258,"SF":0.0094},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":148,"avg":0.18,"obp":0.262,"slg":0.334,"k_pct":0.313,"bb_pct":0.082,"hard_hit":0.402,"outcomes":{"1B":0.1037,"2B":0.0274,"3B":0.0193,"HR":0.0295,"BB":0.0817,"K":0.3127,"OUT":0.3975,"GIDP":0.0052,"HBP":0.022,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":138,"avg":0.228,"obp":0.326,"slg":0.469,"k_pct":0.255,"bb_pct":0.098,"hard_hit":0.39,"outcomes":{"1B":0.1035,"2B":0.0582,"3B":0.0171,"HR":0.0495,"BB":0.0976,"K":0.2546,"OUT":0.3927,"GIDP":0.0216,"HBP":0.0041,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":92,"avg":0.157,"obp":0.258,"slg":0.256,"k_pct":0.321,"bb_pct":0.101,"hard_hit":0.454,"outcomes":{"1B":0.0895,"2B":0.0467,"3B":0.0118,"HR":0.0094,"BB":0.1007,"K":0.3213,"OUT":0.384,"GIDP":0.0348,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":534,"avg":0.228,"obp":0.298,"slg":0.425,"k_pct":0.279,"bb_pct":0.078,"hard_hit":0.47}},"514888":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":184,"avg":0.273,"obp":0.346,"slg":0.409,"k_pct":0.147,"bb_pct":0.073,"hard_hit":0.538,"outcomes":{"1B":0.1993,"2B":0.0338,"3B":0.0176,"HR":0.0223,"BB":0.0735,"K":0.1469,"OUT":0.471,"GIDP":0.0236,"HBP":0.0108,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":151,"avg":0.264,"obp":0.312,"slg":0.437,"k_pct":0.14,"bb_pct":0.048,"hard_hit":0.547,"outcomes":{"1B":0.167,"2B":0.0512,"3B":0.0163,"HR":0.0297,"BB":0.0478,"K":0.14,"OUT":0.482,"GIDP":0.0587,"HBP":0.0063,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":133,"avg":0.247,"obp":0.322,"slg":0.37,"k_pct":0.179,"bb_pct":0.076,"hard_hit":0.406,"outcomes":{"1B":0.1663,"2B":0.0536,"3B":0.0105,"HR":0.0162,"BB":0.0758,"K":0.1793,"OUT":0.4344,"GIDP":0.0445,"HBP":0.0184,"SF":0.0009},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":133,"avg":0.183,"obp":0.247,"slg":0.242,"k_pct":0.241,"bb_pct":0.063,"hard_hit":0.445,"outcomes":{"1B":0.1419,"2B":0.0294,"3B":0.007,"HR":0.005,"BB":0.0634,"K":0.2412,"OUT":0.4685,"GIDP":0.0414,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":166,"avg":0.174,"obp":0.284,"slg":0.28,"k_pct":0.219,"bb_pct":0.11,"hard_hit":0.457,"outcomes":{"1B":0.1183,"2B":0.0305,"3B":0.001,"HR":0.0245,"BB":0.1096,"K":0.2193,"OUT":0.4446,"GIDP":0.0502,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":107,"avg":0.214,"obp":0.295,"slg":0.348,"k_pct":0.166,"bb_pct":0.08,"hard_hit":0.544,"outcomes":{"1B":0.148,"2B":0.0239,"3B":0.018,"HR":0.0246,"BB":0.0803,"K":0.1658,"OUT":0.4581,"GIDP":0.0588,"HBP":0.0012,"SF":0.0213},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":128,"avg":0.206,"obp":0.274,"slg":0.309,"k_pct":0.219,"bb_pct":0.068,"hard_hit":0.421,"outcomes":{"1B":0.1546,"2B":0.0143,"3B":0.0234,"HR":0.0138,"BB":0.068,"K":0.2187,"OUT":0.4275,"GIDP":0.0552,"HBP":0.0098,"SF":0.0147},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":511,"avg":0.244,"obp":0.304,"slg":0.374,"k_pct":0.187,"bb_pct":0.074,"hard_hit":0.412}},"663538":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":190,"avg":0.286,"obp":0.376,"slg":0.477,"k_pct":0.163,"bb_pct":0.09,"hard_hit":0.358,"outcomes":{"1B":0.1768,"2B":0.0662,"3B":0.0057,"HR":0.0376,"BB":0.0901,"K":0.1627,"OUT":0.4287,"GIDP":0.0285,"HBP":0.0026,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":163,"avg":0.248,"obp":0.307,"slg":0.404,"k_pct":0.12,"bb_pct":0.058,"hard_hit":0.545,"outcomes":{"1B":0.1606,"2B":0.0417,"3B":0.0241,"HR":0.0218,"BB":0.0584,"K":0.1196,"OUT":0.4877,"GIDP":0.0569,"HBP":0.024,"SF":0.0051},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":103,"avg":0.242,"obp":0.332,"slg":0.392,"k_pct":0.171,"bb_pct":0.091,"hard_hit":0.538,"outcomes":{"1B":0.1556,"2B":0.0512,"3B":0.0056,"HR":0.0293,"BB":0.0908,"K":0.1707,"OUT":0.4553,"GIDP":0.0345,"HBP":0.001,"SF":0.0059},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":109,"avg":0.184,"obp":0.265,"slg":0.233,"k_pct":0.221,"bb_pct":0.081,"hard_hit":0.318,"outcomes":{"1B":0.1375,"2B":0.0443,"3B":0.001,"HR":0.001,"BB":0.0814,"K":0.2211,"OUT":0.4432,"GIDP":0.0491,"HBP":0.0044,"SF":0.0172},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":132,"avg":0.152,"obp":0.249,"slg":0.191,"k_pct":0.222,"bb_pct":0.097,"hard_hit":0.303,"outcomes":{"1B":0.1183,"2B":0.0293,"3B":0.0033,"HR":0.001,"BB":0.0974,"K":0.2216,"OUT":0.4755,"GIDP":0.0473,"HBP":0.001,"SF":0.0054},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":99,"avg":0.218,"obp":0.301,"slg":0.3,"k_pct":0.177,"bb_pct":0.083,"hard_hit":0.363,"outcomes":{"1B":0.1616,"2B":0.0311,"3B":0.0242,"HR":0.001,"BB":0.0827,"K":0.1774,"OUT":0.4635,"GIDP":0.0565,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":185,"avg":0.195,"obp":0.259,"slg":0.298,"k_pct":0.241,"bb_pct":0.064,"hard_hit":0.52,"outcomes":{"1B":0.1464,"2B":0.0203,"3B":0.001,"HR":0.0271,"BB":0.0639,"K":0.241,"OUT":0.4533,"GIDP":0.0301,"HBP":0.0161,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":428,"avg":0.24,"obp":0.306,"slg":0.362,"k_pct":0.188,"bb_pct":0.081,"hard_hit":0.369}},"656305":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":92,"avg":0.219,"obp":0.298,"slg":0.383,"k_pct":0.246,"bb_pct":0.079,"hard_hit":0.533,"outcomes":{"1B":0.1282,"2B":0.0534,"3B":0.001,"HR":0.0362,"BB":0.0787,"K":0.2458,"OUT":0.3866,"GIDP":0.0373,"HBP":0.0129,"SF":0.0198},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":164,"avg":0.235,"obp":0.304,"slg":0.449,"k_pct":0.203,"bb_pct":0.07,"hard_hit":0.309,"outcomes":{"1B":0.1316,"2B":0.0377,"3B":0.0193,"HR":0.0459,"BB":0.0699,"K":0.2028,"OUT":0.4396,"GIDP":0.0456,"HBP":0.0012,"SF":0.0065},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":186,"avg":0.229,"obp":0.321,"slg":0.44,"k_pct":0.293,"bb_pct":0.091,"hard_hit":0.521,"outcomes":{"1B":0.1291,"2B":0.0331,"3B":0.0228,"HR":0.0441,"BB":0.0914,"K":0.2928,"OUT":0.3815,"GIDP":0.0031,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":109,"avg":0.19,"obp":0.273,"slg":0.354,"k_pct":0.33,"bb_pct":0.082,"hard_hit":0.518,"outcomes":{"1B":0.1077,"2B":0.0419,"3B":0.001,"HR":0.0398,"BB":0.0821,"K":0.3295,"OUT":0.3652,"GIDP":0.03,"HBP":0.0018,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":200,"avg":0.177,"obp":0.288,"slg":0.353,"k_pct":0.282,"bb_pct":0.111,"hard_hit":0.398,"outcomes":{"1B":0.0838,"2B":0.0408,"3B":0.0212,"HR":0.0309,"BB":0.1112,"K":0.2818,"OUT":0.3818,"GIDP":0.0398,"HBP":0.0076,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":99,"avg":0.217,"obp":0.294,"slg":0.43,"k_pct":0.268,"bb_pct":0.077,"hard_hit":0.492,"outcomes":{"1B":0.1152,"2B":0.0466,"3B":0.0011,"HR":0.0546,"BB":0.077,"K":0.2679,"OUT":0.3999,"GIDP":0.0169,"HBP":0.0045,"SF":0.0165},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":132,"avg":0.137,"obp":0.229,"slg":0.211,"k_pct":0.35,"bb_pct":0.092,"hard_hit":0.327,"outcomes":{"1B":0.1012,"2B":0.0156,"3B":0.0011,"HR":0.0189,"BB":0.0922,"K":0.3504,"OUT":0.3991,"GIDP":0.0082,"HBP":0.0065,"SF":0.0068},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":442,"avg":0.222,"obp":0.292,"slg":0.415,"k_pct":0.282,"bb_pct":0.086,"hard_hit":0.421}},"669257":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":153,"avg":0.221,"obp":0.303,"slg":0.43,"k_pct":0.238,"bb_pct":0.082,"hard_hit":0.435,"outcomes":{"1B":0.1148,"2B":0.0544,"3B":0.001,"HR":0.0509,"BB":0.0824,"K":0.2376,"OUT":0.3667,"GIDP":0.0414,"HBP":0.0264,"SF":0.0243},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":200,"avg":0.208,"obp":0.267,"slg":0.347,"k_pct":0.219,"bb_pct":0.059,"hard_hit":0.364,"outcomes":{"1B":0.135,"2B":0.039,"3B":0.0011,"HR":0.0326,"BB":0.0592,"K":0.219,"OUT":0.4567,"GIDP":0.0339,"HBP":0.0226,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":122,"avg":0.189,"obp":0.263,"slg":0.31,"k_pct":0.306,"bb_pct":0.074,"hard_hit":0.412,"outcomes":{"1B":0.1181,"2B":0.0449,"3B":0.001,"HR":0.0249,"BB":0.0742,"K":0.3061,"OUT":0.3835,"GIDP":0.0255,"HBP":0.0207,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":174,"avg":0.192,"obp":0.268,"slg":0.322,"k_pct":0.334,"bb_pct":0.075,"hard_hit":0.481,"outcomes":{"1B":0.115,"2B":0.0469,"3B":0.0079,"HR":0.0224,"BB":0.0755,"K":0.3339,"OUT":0.3861,"GIDP":0.0072,"HBP":0.004,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":167,"avg":0.157,"obp":0.273,"slg":0.286,"k_pct":0.303,"bb_pct":0.115,"hard_hit":0.5,"outcomes":{"1B":0.0918,"2B":0.0338,"3B":0.001,"HR":0.0308,"BB":0.1153,"K":0.3028,"OUT":0.3835,"GIDP":0.0231,"HBP":0.012,"SF":0.006},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":97,"avg":0.199,"obp":0.29,"slg":0.374,"k_pct":0.271,"bb_pct":0.091,"hard_hit":0.465,"outcomes":{"1B":0.1002,"2B":0.0487,"3B":0.0215,"HR":0.0281,"BB":0.0911,"K":0.2709,"OUT":0.3695,"GIDP":0.0386,"HBP":0.0206,"SF":0.0108},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":168,"avg":0.171,"obp":0.242,"slg":0.336,"k_pct":0.342,"bb_pct":0.071,"hard_hit":0.409,"outcomes":{"1B":0.0878,"2B":0.0356,"3B":0.0114,"HR":0.0358,"BB":0.0715,"K":0.3424,"OUT":0.3713,"GIDP":0.0157,"HBP":0.0081,"SF":0.0204},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":429,"avg":0.214,"obp":0.288,"slg":0.385,"k_pct":0.287,"bb_pct":0.081,"hard_hit":0.508}},"678882":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":162,"avg":0.289,"obp":0.354,"slg":0.459,"k_pct":0.206,"bb_pct":0.065,"hard_hit":0.476,"outcomes":{"1B":0.1894,"2B":0.0573,"3B":0.0138,"HR":0.0283,"BB":0.0651,"K":0.2062,"OUT":0.407,"GIDP":0.0146,"HBP":0.0173,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":137,"avg":0.279,"obp":0.321,"slg":0.433,"k_pct":0.156,"bb_pct":0.042,"hard_hit":0.397,"outcomes":{"1B":0.1827,"2B":0.052,"3B":0.0318,"HR":0.0127,"BB":0.042,"K":0.1561,"OUT":0.4677,"GIDP":0.0319,"HBP":0.0148,"SF":0.0083},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":173,"avg":0.229,"obp":0.329,"slg":0.314,"k_pct":0.211,"bb_pct":0.101,"hard_hit":0.337,"outcomes":{"1B":0.1696,"2B":0.0374,"3B":0.0177,"HR":0.0041,"BB":0.1006,"K":0.2107,"OUT":0.4045,"GIDP":0.0371,"HBP":0.001,"SF":0.0174},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":94,"avg":0.192,"obp":0.264,"slg":0.262,"k_pct":0.269,"bb_pct":0.072,"hard_hit":0.306,"outcomes":{"1B":0.1486,"2B":0.0294,"3B":0.001,"HR":0.0128,"BB":0.072,"K":0.2686,"OUT":0.4359,"GIDP":0.0133,"HBP":0.0011,"SF":0.0171},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":182,"avg":0.203,"obp":0.305,"slg":0.357,"k_pct":0.244,"bb_pct":0.101,"hard_hit":0.405,"outcomes":{"1B":0.1358,"2B":0.0146,"3B":0.0203,"HR":0.0327,"BB":0.1012,"K":0.2445,"OUT":0.4288,"GIDP":0.0134,"HBP":0.0062,"SF":0.0025},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":176,"avg":0.216,"obp":0.296,"slg":0.273,"k_pct":0.212,"bb_pct":0.08,"hard_hit":0.483,"outcomes":{"1B":0.1688,"2B":0.0382,"3B":0.0078,"HR":0.0011,"BB":0.08,"K":0.2123,"OUT":0.4545,"GIDP":0.0167,"HBP":0.0195,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":120,"avg":0.223,"obp":0.296,"slg":0.334,"k_pct":0.262,"bb_pct":0.073,"hard_hit":0.455,"outcomes":{"1B":0.1581,"2B":0.0323,"3B":0.0195,"HR":0.0132,"BB":0.0729,"K":0.2617,"OUT":0.3855,"GIDP":0.0262,"HBP":0.0084,"SF":0.0221},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":576,"avg":0.258,"obp":0.319,"slg":0.384,"k_pct":0.223,"bb_pct":0.076,"hard_hit":0.429}},"681911":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":110,"avg":0.236,"obp":0.326,"slg":0.32,"k_pct":0.209,"bb_pct":0.09,"hard_hit":0.379,"outcomes":{"1B":0.1807,"2B":0.0353,"3B":0.0107,"HR":0.0092,"BB":0.09,"K":0.2091,"OUT":0.421,"GIDP":0.0244,"HBP":0.0185,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":102,"avg":0.254,"obp":0.302,"slg":0.368,"k_pct":0.165,"bb_pct":0.048,"hard_hit":0.444,"outcomes":{"1B":0.1775,"2B":0.0507,"3B":0.0132,"HR":0.0124,"BB":0.0483,"K":0.1648,"OUT":0.4641,"GIDP":0.0376,"HBP":0.0199,"SF":0.0115},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":144,"avg":0.224,"obp":0.292,"slg":0.299,"k_pct":0.224,"bb_pct":0.068,"hard_hit":0.47,"outcomes":{"1B":0.1861,"2B":0.0171,"3B":0.0028,"HR":0.0176,"BB":0.0682,"K":0.2242,"OUT":0.4284,"GIDP":0.006,"HBP":0.0248,"SF":0.0247},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":116,"avg":0.213,"obp":0.273,"slg":0.315,"k_pct":0.275,"bb_pct":0.059,"hard_hit":0.344,"outcomes":{"1B":0.1531,"2B":0.031,"3B":0.0182,"HR":0.0112,"BB":0.0593,"K":0.2747,"OUT":0.4412,"GIDP":0.0092,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":85,"avg":0.214,"obp":0.289,"slg":0.342,"k_pct":0.225,"bb_pct":0.075,"hard_hit":0.498,"outcomes":{"1B":0.1387,"2B":0.0398,"3B":0.0187,"HR":0.017,"BB":0.0747,"K":0.2252,"OUT":0.4322,"GIDP":0.033,"HBP":0.0037,"SF":0.017},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":91,"avg":0.232,"obp":0.312,"slg":0.353,"k_pct":0.21,"bb_pct":0.08,"hard_hit":0.414,"outcomes":{"1B":0.176,"2B":0.0197,"3B":0.0074,"HR":0.0288,"BB":0.0799,"K":0.2098,"OUT":0.4566,"GIDP":0.0014,"HBP":0.001,"SF":0.0194},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":106,"avg":0.227,"obp":0.308,"slg":0.339,"k_pct":0.264,"bb_pct":0.08,"hard_hit":0.512,"outcomes":{"1B":0.1633,"2B":0.0395,"3B":0.001,"HR":0.0235,"BB":0.0803,"K":0.2636,"OUT":0.4025,"GIDP":0.0243,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":435,"avg":0.252,"obp":0.31,"slg":0.368,"k_pct":0.225,"bb_pct":0.071,"hard_hit":0.464}},"681536":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":97,"avg":0.27,"obp":0.339,"slg":0.452,"k_pct":0.147,"bb_pct":0.069,"hard_hit":0.55,"outcomes":{"1B":0.1748,"2B":0.0519,"3B":0.001,"HR":0.0426,"BB":0.0691,"K":0.1474,"OUT":0.432,"GIDP":0.0391,"HBP":0.0251,"SF":0.017},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":166,"avg":0.285,"obp":0.327,"slg":0.487,"k_pct":0.135,"bb_pct":0.042,"hard_hit":0.402,"outcomes":{"1B":0.169,"2B":0.0622,"3B":0.0239,"HR":0.0304,"BB":0.042,"K":0.1348,"OUT":0.4379,"GIDP":0.0638,"HBP":0.0216,"SF":0.0144},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":192,"avg":0.222,"obp":0.286,"slg":0.337,"k_pct":0.186,"bb_pct":0.064,"hard_hit":0.396,"outcomes":{"1B":0.1489,"2B":0.0463,"3B":0.0114,"HR":0.0153,"BB":0.0644,"K":0.1858,"OUT":0.4606,"GIDP":0.0369,"HBP":0.0184,"SF":0.012},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":148,"avg":0.215,"obp":0.293,"slg":0.326,"k_pct":0.216,"bb_pct":0.078,"hard_hit":0.403,"outcomes":{"1B":0.1557,"2B":0.0326,"3B":0.001,"HR":0.0256,"BB":0.0781,"K":0.216,"OUT":0.4418,"GIDP":0.0459,"HBP":0.0023,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":177,"avg":0.211,"obp":0.29,"slg":0.304,"k_pct":0.196,"bb_pct":0.079,"hard_hit":0.313,"outcomes":{"1B":0.1445,"2B":0.0515,"3B":0.0047,"HR":0.0106,"BB":0.079,"K":0.1961,"OUT":0.4228,"GIDP":0.0526,"HBP":0.019,"SF":0.0192},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":96,"avg":0.213,"obp":0.301,"slg":0.289,"k_pct":0.175,"bb_pct":0.088,"hard_hit":0.529,"outcomes":{"1B":0.1505,"2B":0.0537,"3B":0.0035,"HR":0.0052,"BB":0.0881,"K":0.1753,"OUT":0.4496,"GIDP":0.061,"HBP":0.001,"SF":0.0121},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":172,"avg":0.2,"obp":0.275,"slg":0.287,"k_pct":0.206,"bb_pct":0.075,"hard_hit":0.482,"outcomes":{"1B":0.1338,"2B":0.0456,"3B":0.0193,"HR":0.001,"BB":0.0754,"K":0.2059,"OUT":0.4624,"GIDP":0.0465,"HBP":0.001,"SF":0.0091},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":479,"avg":0.255,"obp":0.315,"slg":0.392,"k_pct":0.18,"bb_pct":0.071,"hard_hit":0.436}},"681624":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":190,"avg":0.205,"obp":0.308,"slg":0.37,"k_pct":0.265,"bb_pct":0.103,"hard_hit":0.41,"outcomes":{"1B":0.125,"2B":0.0372,"3B":0.0011,"HR":0.0419,"BB":0.1031,"K":0.2649,"OUT":0.4156,"GIDP":0.0059,"HBP":0.0041,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":97,"avg":0.194,"obp":0.249,"slg":0.382,"k_pct":0.219,"bb_pct":0.056,"hard_hit":0.467,"outcomes":{"1B":0.1083,"2B":0.0338,"3B":0.001,"HR":0.0507,"BB":0.0557,"K":0.2187,"OUT":0.4685,"GIDP":0.0262,"HBP":0.0215,"SF":0.0156},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":136,"avg":0.198,"obp":0.267,"slg":0.373,"k_pct":0.284,"bb_pct":0.069,"hard_hit":0.524,"outcomes":{"1B":0.1215,"2B":0.0236,"3B":0.0068,"HR":0.0461,"BB":0.0691,"K":0.2845,"OUT":0.3826,"GIDP":0.0311,"HBP":0.0257,"SF":0.009},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":150,"avg":0.165,"obp":0.235,"slg":0.328,"k_pct":0.36,"bb_pct":0.07,"hard_hit":0.456,"outcomes":{"1B":0.0889,"2B":0.0256,"3B":0.015,"HR":0.0358,"BB":0.0696,"K":0.3604,"OUT":0.3967,"GIDP":0.006,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":162,"avg":0.159,"obp":0.274,"slg":0.27,"k_pct":0.318,"bb_pct":0.115,"hard_hit":0.314,"outcomes":{"1B":0.0998,"2B":0.0216,"3B":0.0209,"HR":0.0162,"BB":0.115,"K":0.3181,"OUT":0.3819,"GIDP":0.0245,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":96,"avg":0.212,"obp":0.288,"slg":0.344,"k_pct":0.251,"bb_pct":0.076,"hard_hit":0.401,"outcomes":{"1B":0.1293,"2B":0.0554,"3B":0.0036,"HR":0.0233,"BB":0.0761,"K":0.2509,"OUT":0.3721,"GIDP":0.042,"HBP":0.0271,"SF":0.0203},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":198,"avg":0.16,"obp":0.25,"slg":0.233,"k_pct":0.355,"bb_pct":0.09,"hard_hit":0.316,"outcomes":{"1B":0.1154,"2B":0.0273,"3B":0.0049,"HR":0.0121,"BB":0.0903,"K":0.3552,"OUT":0.3689,"GIDP":0.0239,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":521,"avg":0.205,"obp":0.279,"slg":0.366,"k_pct":0.293,"bb_pct":0.083,"hard_hit":0.451}},"680977":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":106,"avg":0.283,"obp":0.349,"slg":0.446,"k_pct":0.158,"bb_pct":0.066,"hard_hit":0.553,"outcomes":{"1B":0.1928,"2B":0.0521,"3B":0.0038,"HR":0.0344,"BB":0.0659,"K":0.1577,"OUT":0.4526,"GIDP":0.0324,"HBP":0.0025,"SF":0.0057},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":111,"avg":0.238,"obp":0.304,"slg":0.386,"k_pct":0.136,"bb_pct":0.066,"hard_hit":0.322,"outcomes":{"1B":0.1565,"2B":0.0432,"3B":0.0095,"HR":0.0286,"BB":0.0661,"K":0.136,"OUT":0.4733,"GIDP":0.0576,"HBP":0.0282,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":124,"avg":0.223,"obp":0.315,"slg":0.322,"k_pct":0.184,"bb_pct":0.092,"hard_hit":0.436,"outcomes":{"1B":0.161,"2B":0.039,"3B":0.0106,"HR":0.0127,"BB":0.0917,"K":0.1837,"OUT":0.4345,"GIDP":0.0494,"HBP":0.0164,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":114,"avg":0.199,"obp":0.278,"slg":0.252,"k_pct":0.197,"bb_pct":0.08,"hard_hit":0.436,"outcomes":{"1B":0.1487,"2B":0.048,"3B":0.001,"HR":0.001,"BB":0.0798,"K":0.1973,"OUT":0.4573,"GIDP":0.05,"HBP":0.001,"SF":0.016},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":194,"avg":0.21,"obp":0.302,"slg":0.345,"k_pct":0.185,"bb_pct":0.092,"hard_hit":0.449,"outcomes":{"1B":0.1221,"2B":0.0598,"3B":0.0102,"HR":0.0181,"BB":0.0916,"K":0.1846,"OUT":0.4704,"GIDP":0.027,"HBP":0.001,"SF":0.0151},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":189,"avg":0.215,"obp":0.303,"slg":0.262,"k_pct":0.167,"bb_pct":0.088,"hard_hit":0.309,"outcomes":{"1B":0.1767,"2B":0.0305,"3B":0.0056,"HR":0.0018,"BB":0.0884,"K":0.1672,"OUT":0.4696,"GIDP":0.0369,"HBP":0.001,"SF":0.0222},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":166,"avg":0.201,"obp":0.27,"slg":0.271,"k_pct":0.232,"bb_pct":0.069,"hard_hit":0.535,"outcomes":{"1B":0.1493,"2B":0.0378,"3B":0.01,"HR":0.0039,"BB":0.0686,"K":0.2322,"OUT":0.4345,"GIDP":0.052,"HBP":0.0107,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":465,"avg":0.248,"obp":0.312,"slg":0.361,"k_pct":0.18,"bb_pct":0.079,"hard_hit":0.395}},"680734":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":117,"avg":0.239,"obp":0.345,"slg":0.488,"k_pct":0.256,"bb_pct":0.107,"hard_hit":0.447,"outcomes":{"1B":0.1334,"2B":0.0325,"3B":0.0011,"HR":0.0716,"BB":0.1069,"K":0.2562,"OUT":0.3803,"GIDP":0.0086,"HBP":0.0084,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":80,"avg":0.209,"obp":0.278,"slg":0.396,"k_pct":0.227,"bb_pct":0.068,"hard_hit":0.542,"outcomes":{"1B":0.11,"2B":0.0539,"3B":0.0025,"HR":0.0428,"BB":0.0684,"K":0.2266,"OUT":0.4198,"GIDP":0.055,"HBP":0.02,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":106,"avg":0.2,"obp":0.264,"slg":0.416,"k_pct":0.288,"bb_pct":0.064,"hard_hit":0.438,"outcomes":{"1B":0.096,"2B":0.044,"3B":0.01,"HR":0.0504,"BB":0.0637,"K":0.2885,"OUT":0.412,"GIDP":0.0159,"HBP":0.0185,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":127,"avg":0.177,"obp":0.255,"slg":0.366,"k_pct":0.299,"bb_pct":0.077,"hard_hit":0.419,"outcomes":{"1B":0.0881,"2B":0.0391,"3B":0.001,"HR":0.0491,"BB":0.0772,"K":0.299,"OUT":0.3907,"GIDP":0.0353,"HBP":0.0087,"SF":0.0118},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":188,"avg":0.181,"obp":0.279,"slg":0.346,"k_pct":0.311,"bb_pct":0.098,"hard_hit":0.382,"outcomes":{"1B":0.1022,"2B":0.034,"3B":0.0033,"HR":0.0414,"BB":0.098,"K":0.3107,"OUT":0.3811,"GIDP":0.0271,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":101,"avg":0.234,"obp":0.307,"slg":0.412,"k_pct":0.251,"bb_pct":0.073,"hard_hit":0.417,"outcomes":{"1B":0.1364,"2B":0.0496,"3B":0.0139,"HR":0.0338,"BB":0.0732,"K":0.2511,"OUT":0.3907,"GIDP":0.0374,"HBP":0.0128,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":170,"avg":0.147,"obp":0.237,"slg":0.274,"k_pct":0.335,"bb_pct":0.09,"hard_hit":0.481,"outcomes":{"1B":0.0945,"2B":0.0151,"3B":0.001,"HR":0.0366,"BB":0.0899,"K":0.3353,"OUT":0.4022,"GIDP":0.0037,"HBP":0.0207,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":430,"avg":0.22,"obp":0.294,"slg":0.427,"k_pct":0.281,"bb_pct":0.083,"hard_hit":0.393}},"694699":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":189,"avg":0.298,"obp":0.376,"slg":0.491,"k_pct":0.176,"bb_pct":0.078,"hard_hit":0.418,"outcomes":{"1B":0.2089,"2B":0.0265,"3B":0.0209,"HR":0.0417,"BB":0.0776,"K":0.1758,"OUT":0.3905,"GIDP":0.0335,"HBP":0.001,"SF":0.0236},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":127,"avg":0.264,"obp":0.311,"slg":0.4,"k_pct":0.144,"bb_pct":0.047,"hard_hit":0.478,"outcomes":{"1B":0.1948,"2B":0.0308,"3B":0.0107,"HR":0.0278,"BB":0.0468,"K":0.1441,"OUT":0.475,"GIDP":0.0506,"HBP":0.001,"SF":0.0184},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":188,"avg":0.252,"obp":0.316,"slg":0.398,"k_pct":0.232,"bb_pct":0.064,"hard_hit":0.516,"outcomes":{"1B":0.1896,"2B":0.0135,"3B":0.0136,"HR":0.0351,"BB":0.0637,"K":0.2324,"OUT":0.4023,"GIDP":0.0261,"HBP":0.0226,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":107,"avg":0.175,"obp":0.253,"slg":0.207,"k_pct":0.292,"bb_pct":0.078,"hard_hit":0.536,"outcomes":{"1B":0.1535,"2B":0.0125,"3B":0.008,"HR":0.0011,"BB":0.0781,"K":0.2923,"OUT":0.4347,"GIDP":0.0013,"HBP":0.0175,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":129,"avg":0.182,"obp":0.278,"slg":0.272,"k_pct":0.25,"bb_pct":0.096,"hard_hit":0.336,"outcomes":{"1B":0.1331,"2B":0.0283,"3B":0.001,"HR":0.0199,"BB":0.0962,"K":0.2498,"OUT":0.4266,"GIDP":0.0359,"HBP":0.0083,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":142,"avg":0.232,"obp":0.313,"slg":0.366,"k_pct":0.217,"bb_pct":0.08,"hard_hit":0.389,"outcomes":{"1B":0.1545,"2B":0.0444,"3B":0.0108,"HR":0.0227,"BB":0.0803,"K":0.2169,"OUT":0.4299,"GIDP":0.0306,"HBP":0.0043,"SF":0.0057},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":125,"avg":0.181,"obp":0.267,"slg":0.209,"k_pct":0.266,"bb_pct":0.086,"hard_hit":0.499,"outcomes":{"1B":0.1557,"2B":0.0233,"3B":0.001,"HR":0.001,"BB":0.0856,"K":0.2664,"OUT":0.4309,"GIDP":0.0115,"HBP":0.0218,"SF":0.0029},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":479,"avg":0.25,"obp":0.313,"slg":0.369,"k_pct":0.225,"bb_pct":0.075,"hard_hit":0.545}},"687799":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":125,"avg":0.257,"obp":0.353,"slg":0.427,"k_pct":0.131,"bb_pct":0.096,"hard_hit":0.543,"outcomes":{"1B":0.1628,"2B":0.0559,"3B":0.001,"HR":0.0374,"BB":0.096,"K":0.1313,"OUT":0.4466,"GIDP":0.0286,"HBP":0.0237,"SF":0.0168},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":98,"avg":0.239,"obp":0.309,"slg":0.311,"k_pct":0.125,"bb_pct":0.07,"hard_hit":0.446,"outcomes":{"1B":0.1905,"2B":0.0371,"3B":0.001,"HR":0.0108,"BB":0.0698,"K":0.1249,"OUT":0.4857,"GIDP":0.0684,"HBP":0.0041,"SF":0.0077},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":80,"avg":0.261,"obp":0.338,"slg":0.431,"k_pct":0.179,"bb_pct":0.076,"hard_hit":0.386,"outcomes":{"1B":0.1555,"2B":0.0627,"3B":0.0224,"HR":0.0207,"BB":0.0763,"K":0.1787,"OUT":0.4464,"GIDP":0.0309,"HBP":0.0011,"SF":0.0053},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":94,"avg":0.203,"obp":0.287,"slg":0.265,"k_pct":0.229,"bb_pct":0.084,"hard_hit":0.52,"outcomes":{"1B":0.1472,"2B":0.0532,"3B":0.001,"HR":0.0021,"BB":0.0836,"K":0.2288,"OUT":0.4402,"GIDP":0.0264,"HBP":0.0165,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":181,"avg":0.24,"obp":0.325,"slg":0.407,"k_pct":0.184,"bb_pct":0.086,"hard_hit":0.466,"outcomes":{"1B":0.1444,"2B":0.0584,"3B":0.001,"HR":0.0357,"BB":0.0858,"K":0.1841,"OUT":0.4421,"GIDP":0.0255,"HBP":0.001,"SF":0.022},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":173,"avg":0.228,"obp":0.313,"slg":0.354,"k_pct":0.174,"bb_pct":0.086,"hard_hit":0.479,"outcomes":{"1B":0.1592,"2B":0.0326,"3B":0.0133,"HR":0.0224,"BB":0.0855,"K":0.1743,"OUT":0.4436,"GIDP":0.0465,"HBP":0.0215,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":158,"avg":0.207,"obp":0.279,"slg":0.379,"k_pct":0.227,"bb_pct":0.072,"hard_hit":0.357,"outcomes":{"1B":0.1183,"2B":0.037,"3B":0.0208,"HR":0.0312,"BB":0.0716,"K":0.2268,"OUT":0.4432,"GIDP":0.0201,"HBP":0.0114,"SF":0.0197},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":564,"avg":0.26,"obp":0.326,"slg":0.41,"k_pct":0.178,"bb_pct":0.081,"hard_hit":0.371}},"663624":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":122,"avg":0.219,"obp":0.3,"slg":0.408,"k_pct":0.241,"bb_pct":0.081,"hard_hit":0.416,"outcomes":{"1B":0.1275,"2B":0.0425,"3B":0.001,"HR":0.048,"BB":0.0813,"K":0.241,"OUT":0.3913,"GIDP":0.0372,"HBP":0.0165,"SF":0.0139},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":143,"avg":0.187,"obp":0.243,"slg":0.324,"k_pct":0.206,"bb_pct":0.056,"hard_hit":0.529,"outcomes":{"1B":0.114,"2B":0.0412,"3B":0.001,"HR":0.0312,"BB":0.056,"K":0.2062,"OUT":0.4489,"GIDP":0.0508,"HBP":0.0297,"SF":0.021},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":82,"avg":0.21,"obp":0.294,"slg":0.436,"k_pct":0.293,"bb_pct":0.084,"hard_hit":0.383,"outcomes":{"1B":0.1052,"2B":0.0354,"3B":0.0173,"HR":0.0521,"BB":0.084,"K":0.2935,"OUT":0.373,"GIDP":0.0182,"HBP":0.0202,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":141,"avg":0.169,"obp":0.249,"slg":0.27,"k_pct":0.326,"bb_pct":0.08,"hard_hit":0.483,"outcomes":{"1B":0.1195,"2B":0.0232,"3B":0.001,"HR":0.0253,"BB":0.0802,"K":0.3257,"OUT":0.4007,"GIDP":0.0038,"HBP":0.0119,"SF":0.0086},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":149,"avg":0.164,"obp":0.246,"slg":0.312,"k_pct":0.295,"bb_pct":0.083,"hard_hit":0.369,"outcomes":{"1B":0.0877,"2B":0.0363,"3B":0.0073,"HR":0.0325,"BB":0.0826,"K":0.2947,"OUT":0.411,"GIDP":0.0165,"HBP":0.0102,"SF":0.0211},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":156,"avg":0.196,"obp":0.295,"slg":0.366,"k_pct":0.261,"bb_pct":0.099,"hard_hit":0.425,"outcomes":{"1B":0.1181,"2B":0.0313,"3B":0.0011,"HR":0.0455,"BB":0.0993,"K":0.2612,"OUT":0.4079,"GIDP":0.0235,"HBP":0.0011,"SF":0.0111},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":162,"avg":0.156,"obp":0.245,"slg":0.325,"k_pct":0.317,"bb_pct":0.089,"hard_hit":0.441,"outcomes":{"1B":0.0844,"2B":0.0184,"3B":0.0086,"HR":0.0444,"BB":0.0895,"K":0.3167,"OUT":0.394,"GIDP":0.019,"HBP":0.024,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":467,"avg":0.209,"obp":0.284,"slg":0.392,"k_pct":0.277,"bb_pct":0.082,"hard_hit":0.424}},"660670":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":165,"avg":0.249,"obp":0.324,"slg":0.362,"k_pct":0.172,"bb_pct":0.074,"hard_hit":0.389,"outcomes":{"1B":0.1849,"2B":0.0395,"3B":0.0011,"HR":0.0238,"BB":0.0744,"K":0.1725,"OUT":0.4564,"GIDP":0.0275,"HBP":0.0188,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":192,"avg":0.257,"obp":0.326,"slg":0.397,"k_pct":0.136,"bb_pct":0.07,"hard_hit":0.361,"outcomes":{"1B":0.163,"2B":0.0653,"3B":0.0091,"HR":0.0191,"BB":0.0699,"K":0.1355,"OUT":0.4526,"GIDP":0.0583,"HBP":0.0234,"SF":0.0038},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":137,"avg":0.212,"obp":0.296,"slg":0.293,"k_pct":0.173,"bb_pct":0.084,"hard_hit":0.345,"outcomes":{"1B":0.1538,"2B":0.0362,"3B":0.0204,"HR":0.0014,"BB":0.0839,"K":0.1728,"OUT":0.4483,"GIDP":0.06,"HBP":0.001,"SF":0.0222},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":113,"avg":0.221,"obp":0.283,"slg":0.311,"k_pct":0.214,"bb_pct":0.062,"hard_hit":0.383,"outcomes":{"1B":0.1488,"2B":0.055,"3B":0.0162,"HR":0.0009,"BB":0.0625,"K":0.2143,"OUT":0.4178,"GIDP":0.0559,"HBP":0.0122,"SF":0.0162},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":155,"avg":0.205,"obp":0.293,"slg":0.315,"k_pct":0.206,"bb_pct":0.089,"hard_hit":0.436,"outcomes":{"1B":0.1338,"2B":0.0503,"3B":0.001,"HR":0.0195,"BB":0.0886,"K":0.2061,"OUT":0.4337,"GIDP":0.0545,"HBP":0.001,"SF":0.0116},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":148,"avg":0.219,"obp":0.299,"slg":0.328,"k_pct":0.188,"bb_pct":0.081,"hard_hit":0.529,"outcomes":{"1B":0.1572,"2B":0.0367,"3B":0.001,"HR":0.0236,"BB":0.0806,"K":0.1881,"OUT":0.4683,"GIDP":0.0426,"HBP":0.001,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":130,"avg":0.204,"obp":0.284,"slg":0.299,"k_pct":0.208,"bb_pct":0.079,"hard_hit":0.531,"outcomes":{"1B":0.1556,"2B":0.0206,"3B":0.0102,"HR":0.0179,"BB":0.0792,"K":0.2076,"OUT":0.4476,"GIDP":0.0449,"HBP":0.0153,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":504,"avg":0.247,"obp":0.311,"slg":0.364,"k_pct":0.185,"bb_pct":0.077,"hard_hit":0.488}},"572816":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":191,"avg":0.237,"obp":0.312,"slg":0.349,"k_pct":0.165,"bb_pct":0.075,"hard_hit":0.359,"outcomes":{"1B":0.1653,"2B":0.05,"3B":0.001,"HR":0.0203,"BB":0.075,"K":0.165,"OUT":0.4311,"GIDP":0.0548,"HBP":0.0248,"SF":0.0126},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":142,"avg":0.249,"obp":0.318,"slg":0.375,"k_pct":0.134,"bb_pct":0.069,"hard_hit":0.497,"outcomes":{"1B":0.1617,"2B":0.0596,"3B":0.0169,"HR":0.0108,"BB":0.069,"K":0.1339,"OUT":0.4627,"GIDP":0.0576,"HBP":0.0265,"SF":0.0013},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":104,"avg":0.244,"obp":0.317,"slg":0.33,"k_pct":0.172,"bb_pct":0.073,"hard_hit":0.528,"outcomes":{"1B":0.177,"2B":0.0535,"3B":0.0067,"HR":0.0064,"BB":0.0734,"K":0.1725,"OUT":0.4311,"GIDP":0.0548,"HBP":0.0235,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":167,"avg":0.165,"obp":0.235,"slg":0.195,"k_pct":0.214,"bb_pct":0.07,"hard_hit":0.308,"outcomes":{"1B":0.1387,"2B":0.0242,"3B":0.0011,"HR":0.0011,"BB":0.0698,"K":0.2145,"OUT":0.4819,"GIDP":0.0418,"HBP":0.0042,"SF":0.0227},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":116,"avg":0.2,"obp":0.292,"slg":0.343,"k_pct":0.192,"bb_pct":0.092,"hard_hit":0.307,"outcomes":{"1B":0.1234,"2B":0.0433,"3B":0.001,"HR":0.0324,"BB":0.0924,"K":0.1917,"OUT":0.4315,"GIDP":0.0551,"HBP":0.0177,"SF":0.0114},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":178,"avg":0.232,"obp":0.294,"slg":0.35,"k_pct":0.167,"bb_pct":0.062,"hard_hit":0.477,"outcomes":{"1B":0.1493,"2B":0.0569,"3B":0.017,"HR":0.009,"BB":0.0619,"K":0.1672,"OUT":0.4607,"GIDP":0.0484,"HBP":0.01,"SF":0.0195},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":194,"avg":0.181,"obp":0.249,"slg":0.278,"k_pct":0.222,"bb_pct":0.068,"hard_hit":0.398,"outcomes":{"1B":0.1377,"2B":0.0152,"3B":0.001,"HR":0.0268,"BB":0.0683,"K":0.2223,"OUT":0.4635,"GIDP":0.0481,"HBP":0.0162,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":509,"avg":0.239,"obp":0.306,"slg":0.353,"k_pct":0.181,"bb_pct":0.073,"hard_hit":0.442}},"594807":{"pitch_mix":{"FF":0.1429,"SI":0.1429,"CH":0.1429,"SL":0.1429,"CU":0.1429,"FC":0.1429,"FS":0.1429},"vs_pitch":{"FF":{"pct":0.1429,"sample":156,"avg":0.216,"obp":0.359,"slg":0.38,"k_pct":0.16,"bb_pct":0.143,"hard_hit":0.458,"outcomes":{"1B":0.1385,"2B":0.032,"3B":0.0058,"HR":0.0399,"BB":0.1431,"K":0.16,"OUT":0.3992,"GIDP":0.0486,"HBP":0.0255,"SF":0.0074},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SI":{"pct":0.1429,"sample":99,"avg":0.192,"obp":0.308,"slg":0.352,"k_pct":0.175,"bb_pct":0.116,"hard_hit":0.434,"outcomes":{"1B":0.122,"2B":0.0243,"3B":0.001,"HR":0.0446,"BB":0.1157,"K":0.1746,"OUT":0.4307,"GIDP":0.0585,"HBP":0.0277,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CH":{"pct":0.1429,"sample":196,"avg":0.216,"obp":0.342,"slg":0.41,"k_pct":0.219,"bb_pct":0.125,"hard_hit":0.409,"outcomes":{"1B":0.129,"2B":0.024,"3B":0.0197,"HR":0.0436,"BB":0.1253,"K":0.2187,"OUT":0.4159,"GIDP":0.0119,"HBP":0.0107,"SF":0.0011},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"SL":{"pct":0.1429,"sample":165,"avg":0.165,"obp":0.284,"slg":0.287,"k_pct":0.271,"bb_pct":0.118,"hard_hit":0.393,"outcomes":{"1B":0.1063,"2B":0.0216,"3B":0.0124,"HR":0.0251,"BB":0.1185,"K":0.271,"OUT":0.3716,"GIDP":0.0316,"HBP":0.0216,"SF":0.0204},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"CU":{"pct":0.1429,"sample":167,"avg":0.157,"obp":0.299,"slg":0.276,"k_pct":0.239,"bb_pct":0.142,"hard_hit":0.534,"outcomes":{"1B":0.1022,"2B":0.0168,"3B":0.0103,"HR":0.0274,"BB":0.142,"K":0.2392,"OUT":0.3902,"GIDP":0.0391,"HBP":0.0124,"SF":0.0205},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FC":{"pct":0.1429,"sample":86,"avg":0.221,"obp":0.35,"slg":0.382,"k_pct":0.218,"bb_pct":0.128,"hard_hit":0.525,"outcomes":{"1B":0.1478,"2B":0.0292,"3B":0.001,"HR":0.0433,"BB":0.1282,"K":0.2179,"OUT":0.3891,"GIDP":0.0338,"HBP":0.0086,"SF":0.001},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}},"FS":{"pct":0.1429,"sample":97,"avg":0.189,"obp":0.322,"slg":0.338,"k_pct":0.281,"bb_pct":0.134,"hard_hit":0.558,"outcomes":{"1B":0.1081,"2B":0.0456,"3B":0.001,"HR":0.0339,"BB":0.1335,"K":0.281,"OUT":0.3578,"GIDP":0.0209,"HBP":0.001,"SF":0.0173},"zones":{"heart":0.28,"shadow":0.44,"chase":0.2,"waste":0.08}}},"overall":{"pa":507,"avg":0.229,"obp":0.339,"slg":0.41,"k_pct":0.223,"bb_pct":0.13,"hard_hit":0.432}}},"pitchers":{"594798":{"pitch_mix":{"FF":0.3828,"SL":0.2666,"CH":0.1384,"CU":0.0994,"FC":0.0635,"SI":0.0494},"vs_pitch":{"FF":{"pct":0.3828,"sample":247,"avg":0.247,"obp":0.31,"slg":0.372,"k_pct":0.177,"bb_pct":0.063,"hard_hit":0.405,"outcomes":{"1B":0.1671,"2B":0.0576,"3B":0.001,"HR":0.0217,"BB":0.0627,"K":0.1769,"OUT":0.459,"GIDP":0.0279,"HBP":0.0214,"SF":0.0048},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0494,"sample":47,"avg":0.197,"obp":0.257,"slg":0.281,"k_pct":0.141,"bb_pct":0.059,"hard_hit":0.413,"outcomes":{"1B":0.1362,"2B":0.0477,"3B":0.0032,"HR":0.01,"BB":0.0594,"K":0.1407,"OUT":0.4842,"GIDP":0.0697,"HBP":0.0282,"SF":0.0208},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1384,"sample":105,"avg":0.207,"obp":0.299,"slg":0.31,"k_pct":0.202,"bb_pct":0.092,"hard_hit":0.287,"outcomes":{"1B":0.1357,"2B":0.0496,"3B":0.0117,"HR":0.0099,"BB":0.0924,"K":0.2023,"OUT":0.4479,"GIDP":0.0372,"HBP":0.0122,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2666,"sample":139,"avg":0.187,"obp":0.253,"slg":0.266,"k_pct":0.242,"bb_pct":0.066,"hard_hit":0.432,"outcomes":{"1B":0.1343,"2B":0.0373,"3B":0.0057,"HR":0.01,"BB":0.0658,"K":0.2422,"OUT":0.4251,"GIDP":0.0584,"HBP":0.0075,"SF":0.0136},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0994,"sample":31,"avg":0.183,"obp":0.259,"slg":0.274,"k_pct":0.242,"bb_pct":0.076,"hard_hit":0.34,"outcomes":{"1B":0.1284,"2B":0.0366,"3B":0.001,"HR":0.0174,"BB":0.0761,"K":0.2418,"OUT":0.4588,"GIDP":0.0271,"HBP":0.0027,"SF":0.0101},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0635,"sample":15,"avg":0.235,"obp":0.29,"slg":0.355,"k_pct":0.193,"bb_pct":0.055,"hard_hit":0.368,"outcomes":{"1B":0.1553,"2B":0.0538,"3B":0.0105,"HR":0.0152,"BB":0.055,"K":0.1934,"OUT":0.4907,"GIDP":0.0232,"HBP":0.0011,"SF":0.0019},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":29,"avg":0.16,"obp":0.233,"slg":0.232,"k_pct":0.26,"bb_pct":0.073,"hard_hit":0.424,"outcomes":{"1B":0.1209,"2B":0.0164,"3B":0.012,"HR":0.0105,"BB":0.0731,"K":0.2596,"OUT":0.4629,"GIDP":0.0312,"HBP":0.0124,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":550,"avg":0.237,"obp":0.298,"slg":0.351,"k_pct":0.203,"bb_pct":0.068,"hard_hit":0.494}},"656302":{"pitch_mix":{"FF":0.5827,"SI":0.0585,"SL":0.2006,"CH":0.0904,"CU":0.0428,"FC":0.025},"vs_pitch":{"FF":{"pct":0.5827,"sample":361,"avg":0.231,"obp":0.294,"slg":0.33,"k_pct":0.212,"bb_pct":0.063,"hard_hit":0.294,"outcomes":{"1B":0.1666,"2B":0.0391,"3B":0.0156,"HR":0.0097,"BB":0.0634,"K":0.2122,"OUT":0.4301,"GIDP":0.0589,"HBP":0.0033,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0585,"sample":23,"avg":0.209,"obp":0.277,"slg":0.344,"k_pct":0.166,"bb_pct":0.068,"hard_hit":0.322,"outcomes":{"1B":0.1279,"2B":0.0506,"3B":0.0055,"HR":0.0247,"BB":0.0679,"K":0.1661,"OUT":0.4664,"GIDP":0.0727,"HBP":0.015,"SF":0.0031},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.0904,"sample":24,"avg":0.212,"obp":0.284,"slg":0.373,"k_pct":0.229,"bb_pct":0.072,"hard_hit":0.416,"outcomes":{"1B":0.1179,"2B":0.0508,"3B":0.0203,"HR":0.0232,"BB":0.0719,"K":0.2294,"OUT":0.4224,"GIDP":0.0238,"HBP":0.0214,"SF":0.0189},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2006,"sample":119,"avg":0.163,"obp":0.237,"slg":0.22,"k_pct":0.281,"bb_pct":0.074,"hard_hit":0.323,"outcomes":{"1B":0.1256,"2B":0.0265,"3B":0.001,"HR":0.0096,"BB":0.074,"K":0.2805,"OUT":0.4288,"GIDP":0.052,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0428,"sample":21,"avg":0.182,"obp":0.28,"slg":0.306,"k_pct":0.235,"bb_pct":0.098,"hard_hit":0.426,"outcomes":{"1B":0.1007,"2B":0.0517,"3B":0.0163,"HR":0.0132,"BB":0.0976,"K":0.235,"OUT":0.4385,"GIDP":0.0214,"HBP":0.0247,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.025,"sample":15,"avg":0.184,"obp":0.26,"slg":0.268,"k_pct":0.221,"bb_pct":0.076,"hard_hit":0.427,"outcomes":{"1B":0.129,"2B":0.0398,"3B":0.0023,"HR":0.0131,"BB":0.0756,"K":0.2208,"OUT":0.4327,"GIDP":0.0515,"HBP":0.0169,"SF":0.0183},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":18,"avg":0.138,"obp":0.209,"slg":0.195,"k_pct":0.28,"bb_pct":0.071,"hard_hit":0.42,"outcomes":{"1B":0.1021,"2B":0.0258,"3B":0.001,"HR":0.0096,"BB":0.0707,"K":0.2796,"OUT":0.4449,"GIDP":0.0493,"HBP":0.0107,"SF":0.0064},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":552,"avg":0.229,"obp":0.286,"slg":0.337,"k_pct":0.226,"bb_pct":0.068,"hard_hit":0.455}},"680694":{"pitch_mix":{"FF":0.3729,"CH":0.2022,"SL":0.1623,"FC":0.1812,"CU":0.0707,"SI":0.0106},"vs_pitch":{"FF":{"pct":0.3729,"sample":221,"avg":0.266,"obp":0.358,"slg":0.38,"k_pct":0.168,"bb_pct":0.091,"hard_hit":0.346,"outcomes":{"1B":0.1843,"2B":0.0606,"3B":0.0112,"HR":0.0103,"BB":0.0912,"K":0.1682,"OUT":0.4461,"GIDP":0.0261,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0106,"sample":10,"avg":0.232,"obp":0.292,"slg":0.319,"k_pct":0.148,"bb_pct":0.06,"hard_hit":0.311,"outcomes":{"1B":0.1668,"2B":0.0543,"3B":0.001,"HR":0.0102,"BB":0.0599,"K":0.1477,"OUT":0.4841,"GIDP":0.0712,"HBP":0.0039,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2022,"sample":98,"avg":0.251,"obp":0.349,"slg":0.402,"k_pct":0.169,"bb_pct":0.099,"hard_hit":0.407,"outcomes":{"1B":0.1574,"2B":0.0586,"3B":0.0107,"HR":0.0239,"BB":0.0986,"K":0.169,"OUT":0.435,"GIDP":0.0447,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1623,"sample":118,"avg":0.208,"obp":0.288,"slg":0.308,"k_pct":0.199,"bb_pct":0.08,"hard_hit":0.422,"outcomes":{"1B":0.1329,"2B":0.061,"3B":0.0042,"HR":0.0101,"BB":0.0798,"K":0.1992,"OUT":0.4736,"GIDP":0.0326,"HBP":0.0056,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0707,"sample":49,"avg":0.166,"obp":0.252,"slg":0.231,"k_pct":0.206,"bb_pct":0.087,"hard_hit":0.332,"outcomes":{"1B":0.1251,"2B":0.0275,"3B":0.0011,"HR":0.0119,"BB":0.0868,"K":0.206,"OUT":0.5125,"GIDP":0.026,"HBP":0.0011,"SF":0.0021},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1812,"sample":108,"avg":0.212,"obp":0.279,"slg":0.334,"k_pct":0.165,"bb_pct":0.067,"hard_hit":0.374,"outcomes":{"1B":0.1377,"2B":0.0504,"3B":0.001,"HR":0.023,"BB":0.0674,"K":0.1647,"OUT":0.4916,"GIDP":0.0587,"HBP":0.0043,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.157,"obp":0.231,"slg":0.223,"k_pct":0.238,"bb_pct":0.074,"hard_hit":0.3,"outcomes":{"1B":0.1146,"2B":0.0304,"3B":0.0011,"HR":0.0111,"BB":0.0743,"K":0.2379,"OUT":0.4961,"GIDP":0.0307,"HBP":0.0026,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":565,"avg":0.26,"obp":0.325,"slg":0.388,"k_pct":0.175,"bb_pct":0.086,"hard_hit":0.362}},"677651":{"pitch_mix":{"FF":0.457,"SI":0.1084,"SL":0.2145,"CH":0.0932,"CU":0.0573,"FC":0.0696},"vs_pitch":{"FF":{"pct":0.457,"sample":302,"avg":0.22,"obp":0.293,"slg":0.332,"k_pct":0.207,"bb_pct":0.073,"hard_hit":0.391,"outcomes":{"1B":0.1429,"2B":0.0515,"3B":0.0158,"HR":0.0096,"BB":0.0733,"K":0.2072,"OUT":0.4321,"GIDP":0.0389,"HBP":0.0052,"SF":0.0235},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1084,"sample":70,"avg":0.191,"obp":0.261,"slg":0.266,"k_pct":0.17,"bb_pct":0.07,"hard_hit":0.418,"outcomes":{"1B":0.1356,"2B":0.0444,"3B":0.001,"HR":0.0096,"BB":0.0699,"K":0.1695,"OUT":0.4687,"GIDP":0.0731,"HBP":0.0102,"SF":0.0182},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.0932,"sample":36,"avg":0.216,"obp":0.296,"slg":0.321,"k_pct":0.211,"bb_pct":0.081,"hard_hit":0.361,"outcomes":{"1B":0.1409,"2B":0.0546,"3B":0.0107,"HR":0.0096,"BB":0.0807,"K":0.2112,"OUT":0.4123,"GIDP":0.0445,"HBP":0.0259,"SF":0.0095},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2145,"sample":116,"avg":0.165,"obp":0.231,"slg":0.227,"k_pct":0.262,"bb_pct":0.066,"hard_hit":0.42,"outcomes":{"1B":0.1225,"2B":0.0315,"3B":0.001,"HR":0.0096,"BB":0.0664,"K":0.2618,"OUT":0.438,"GIDP":0.0352,"HBP":0.0172,"SF":0.0169},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0573,"sample":13,"avg":0.142,"obp":0.215,"slg":0.194,"k_pct":0.244,"bb_pct":0.073,"hard_hit":0.414,"outcomes":{"1B":0.11,"2B":0.0209,"3B":0.0011,"HR":0.0097,"BB":0.0735,"K":0.2437,"OUT":0.4492,"GIDP":0.0524,"HBP":0.0279,"SF":0.0116},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0696,"sample":46,"avg":0.194,"obp":0.273,"slg":0.282,"k_pct":0.204,"bb_pct":0.078,"hard_hit":0.342,"outcomes":{"1B":0.1401,"2B":0.0302,"3B":0.0144,"HR":0.0095,"BB":0.0784,"K":0.2036,"OUT":0.4413,"GIDP":0.0471,"HBP":0.0224,"SF":0.013},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.175,"obp":0.233,"slg":0.272,"k_pct":0.261,"bb_pct":0.058,"hard_hit":0.282,"outcomes":{"1B":0.1129,"2B":0.0394,"3B":0.0112,"HR":0.0117,"BB":0.0583,"K":0.261,"OUT":0.4209,"GIDP":0.0485,"HBP":0.0146,"SF":0.0214},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":484,"avg":0.221,"obp":0.283,"slg":0.323,"k_pct":0.217,"bb_pct":0.072,"hard_hit":0.391}},"621111":{"pitch_mix":{"FF":0.4055,"SL":0.2632,"CH":0.1373,"CU":0.0926,"FC":0.0573,"SI":0.0441},"vs_pitch":{"FF":{"pct":0.4055,"sample":260,"avg":0.234,"obp":0.323,"slg":0.35,"k_pct":0.167,"bb_pct":0.089,"hard_hit":0.362,"outcomes":{"1B":0.1543,"2B":0.0533,"3B":0.0165,"HR":0.0099,"BB":0.0887,"K":0.1671,"OUT":0.4266,"GIDP":0.0592,"HBP":0.001,"SF":0.0234},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0441,"sample":16,"avg":0.218,"obp":0.284,"slg":0.314,"k_pct":0.154,"bb_pct":0.066,"hard_hit":0.376,"outcomes":{"1B":0.1511,"2B":0.0488,"3B":0.0086,"HR":0.0098,"BB":0.0655,"K":0.1538,"OUT":0.4895,"GIDP":0.0707,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1373,"sample":85,"avg":0.221,"obp":0.31,"slg":0.333,"k_pct":0.198,"bb_pct":0.09,"hard_hit":0.291,"outcomes":{"1B":0.1474,"2B":0.044,"3B":0.0193,"HR":0.0099,"BB":0.0896,"K":0.1981,"OUT":0.4137,"GIDP":0.0472,"HBP":0.0088,"SF":0.0218},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2632,"sample":160,"avg":0.183,"obp":0.244,"slg":0.264,"k_pct":0.238,"bb_pct":0.062,"hard_hit":0.356,"outcomes":{"1B":0.1276,"2B":0.0385,"3B":0.0068,"HR":0.0098,"BB":0.0618,"K":0.2379,"OUT":0.4655,"GIDP":0.0361,"HBP":0.0011,"SF":0.0148},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0926,"sample":81,"avg":0.183,"obp":0.267,"slg":0.285,"k_pct":0.219,"bb_pct":0.084,"hard_hit":0.331,"outcomes":{"1B":0.1126,"2B":0.05,"3B":0.011,"HR":0.0098,"BB":0.0837,"K":0.2189,"OUT":0.4552,"GIDP":0.0567,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0573,"sample":10,"avg":0.221,"obp":0.281,"slg":0.312,"k_pct":0.212,"bb_pct":0.06,"hard_hit":0.327,"outcomes":{"1B":0.1522,"2B":0.0564,"3B":0.001,"HR":0.0111,"BB":0.0598,"K":0.2118,"OUT":0.4513,"GIDP":0.0341,"HBP":0.0206,"SF":0.0018},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.156,"obp":0.252,"slg":0.209,"k_pct":0.254,"bb_pct":0.096,"hard_hit":0.418,"outcomes":{"1B":0.1227,"2B":0.0222,"3B":0.001,"HR":0.0098,"BB":0.0964,"K":0.2544,"OUT":0.4397,"GIDP":0.044,"HBP":0.001,"SF":0.0089},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":528,"avg":0.236,"obp":0.294,"slg":0.35,"k_pct":0.197,"bb_pct":0.079,"hard_hit":0.517}},"605400":{"pitch_mix":{"FF":0.351,"SL":0.2576,"CH":0.1681,"CU":0.1299,"FC":0.0418,"SI":0.0516},"vs_pitch":{"FF":{"pct":0.351,"sample":238,"avg":0.248,"obp":0.316,"slg":0.394,"k_pct":0.175,"bb_pct":0.067,"hard_hit":0.321,"outcomes":{"1B":0.1579,"2B":0.0627,"3B":0.0011,"HR":0.0268,"BB":0.0672,"K":0.1752,"OUT":0.4556,"GIDP":0.0329,"HBP":0.0011,"SF":0.0195},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0516,"sample":44,"avg":0.21,"obp":0.275,"slg":0.299,"k_pct":0.158,"bb_pct":0.066,"hard_hit":0.416,"outcomes":{"1B":0.1424,"2B":0.0541,"3B":0.0032,"HR":0.0098,"BB":0.0655,"K":0.1581,"OUT":0.4754,"GIDP":0.0634,"HBP":0.0198,"SF":0.0082},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1681,"sample":80,"avg":0.197,"obp":0.283,"slg":0.293,"k_pct":0.194,"bb_pct":0.086,"hard_hit":0.365,"outcomes":{"1B":0.137,"2B":0.0408,"3B":0.001,"HR":0.0179,"BB":0.0858,"K":0.1941,"OUT":0.4652,"GIDP":0.0359,"HBP":0.0213,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2576,"sample":147,"avg":0.163,"obp":0.249,"slg":0.26,"k_pct":0.22,"bb_pct":0.086,"hard_hit":0.433,"outcomes":{"1B":0.1019,"2B":0.0346,"3B":0.0164,"HR":0.01,"BB":0.0859,"K":0.2201,"OUT":0.4441,"GIDP":0.055,"HBP":0.0192,"SF":0.0128},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1299,"sample":93,"avg":0.163,"obp":0.259,"slg":0.251,"k_pct":0.233,"bb_pct":0.096,"hard_hit":0.335,"outcomes":{"1B":0.0949,"2B":0.057,"3B":0.0011,"HR":0.0098,"BB":0.0964,"K":0.2325,"OUT":0.4688,"GIDP":0.0242,"HBP":0.0011,"SF":0.0141},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0418,"sample":49,"avg":0.204,"obp":0.264,"slg":0.292,"k_pct":0.218,"bb_pct":0.06,"hard_hit":0.4,"outcomes":{"1B":0.1411,"2B":0.0471,"3B":0.0056,"HR":0.0099,"BB":0.0604,"K":0.218,"OUT":0.4498,"GIDP":0.028,"HBP":0.0215,"SF":0.0186},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":18,"avg":0.186,"obp":0.271,"slg":0.266,"k_pct":0.234,"bb_pct":0.085,"hard_hit":0.385,"outcomes":{"1B":0.1358,"2B":0.0311,"3B":0.0095,"HR":0.0098,"BB":0.0846,"K":0.2341,"OUT":0.4266,"GIDP":0.0421,"HBP":0.0254,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":445,"avg":0.226,"obp":0.292,"slg":0.351,"k_pct":0.198,"bb_pct":0.079,"hard_hit":0.407}},"676596":{"pitch_mix":{"FF":0.5088,"SI":0.0581,"SL":0.2084,"CH":0.0904,"CU":0.0762,"FC":0.0581},"vs_pitch":{"FF":{"pct":0.5088,"sample":298,"avg":0.245,"obp":0.31,"slg":0.431,"k_pct":0.197,"bb_pct":0.065,"hard_hit":0.301,"outcomes":{"1B":0.1423,"2B":0.0513,"3B":0.0188,"HR":0.0325,"BB":0.065,"K":0.197,"OUT":0.4297,"GIDP":0.0472,"HBP":0.0152,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0581,"sample":12,"avg":0.225,"obp":0.275,"slg":0.324,"k_pct":0.183,"bb_pct":0.049,"hard_hit":0.423,"outcomes":{"1B":0.1501,"2B":0.0615,"3B":0.0042,"HR":0.0096,"BB":0.0493,"K":0.1826,"OUT":0.4412,"GIDP":0.0607,"HBP":0.0224,"SF":0.0183},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.0904,"sample":37,"avg":0.192,"obp":0.281,"slg":0.311,"k_pct":0.23,"bb_pct":0.089,"hard_hit":0.425,"outcomes":{"1B":0.1185,"2B":0.046,"3B":0.0103,"HR":0.0175,"BB":0.0892,"K":0.2299,"OUT":0.4153,"GIDP":0.049,"HBP":0.0104,"SF":0.0138},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2084,"sample":124,"avg":0.189,"obp":0.265,"slg":0.304,"k_pct":0.252,"bb_pct":0.077,"hard_hit":0.36,"outcomes":{"1B":0.1156,"2B":0.0397,"3B":0.0236,"HR":0.0096,"BB":0.0769,"K":0.2521,"OUT":0.4167,"GIDP":0.0483,"HBP":0.0164,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0762,"sample":51,"avg":0.135,"obp":0.239,"slg":0.199,"k_pct":0.269,"bb_pct":0.105,"hard_hit":0.432,"outcomes":{"1B":0.0905,"2B":0.0334,"3B":0.001,"HR":0.0096,"BB":0.1048,"K":0.2691,"OUT":0.4413,"GIDP":0.0485,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0581,"sample":17,"avg":0.233,"obp":0.298,"slg":0.351,"k_pct":0.219,"bb_pct":0.065,"hard_hit":0.363,"outcomes":{"1B":0.149,"2B":0.0594,"3B":0.0147,"HR":0.0099,"BB":0.0652,"K":0.2191,"OUT":0.4552,"GIDP":0.0228,"HBP":0.0038,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":23,"avg":0.188,"obp":0.246,"slg":0.308,"k_pct":0.273,"bb_pct":0.058,"hard_hit":0.322,"outcomes":{"1B":0.1246,"2B":0.0243,"3B":0.0197,"HR":0.019,"BB":0.0584,"K":0.2727,"OUT":0.412,"GIDP":0.0557,"HBP":0.0126,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":559,"avg":0.239,"obp":0.304,"slg":0.401,"k_pct":0.217,"bb_pct":0.072,"hard_hit":0.464}},"668678":{"pitch_mix":{"FF":0.2797,"SI":0.1142,"CH":0.2351,"SL":0.1987,"CU":0.11,"FC":0.0623},"vs_pitch":{"FF":{"pct":0.2797,"sample":151,"avg":0.254,"obp":0.33,"slg":0.385,"k_pct":0.165,"bb_pct":0.075,"hard_hit":0.292,"outcomes":{"1B":0.1829,"2B":0.0398,"3B":0.0033,"HR":0.0282,"BB":0.0755,"K":0.1654,"OUT":0.4557,"GIDP":0.0207,"HBP":0.0259,"SF":0.0027},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1142,"sample":68,"avg":0.215,"obp":0.287,"slg":0.288,"k_pct":0.12,"bb_pct":0.072,"hard_hit":0.357,"outcomes":{"1B":0.1638,"2B":0.0403,"3B":0.001,"HR":0.0102,"BB":0.072,"K":0.1203,"OUT":0.492,"GIDP":0.0759,"HBP":0.0198,"SF":0.0045},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2351,"sample":121,"avg":0.217,"obp":0.287,"slg":0.303,"k_pct":0.186,"bb_pct":0.07,"hard_hit":0.321,"outcomes":{"1B":0.1552,"2B":0.0493,"3B":0.0027,"HR":0.0102,"BB":0.0699,"K":0.1863,"OUT":0.4565,"GIDP":0.0435,"HBP":0.0253,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1987,"sample":119,"avg":0.196,"obp":0.249,"slg":0.307,"k_pct":0.232,"bb_pct":0.054,"hard_hit":0.419,"outcomes":{"1B":0.114,"2B":0.0617,"3B":0.0095,"HR":0.0103,"BB":0.0537,"K":0.2315,"OUT":0.483,"GIDP":0.0331,"HBP":0.001,"SF":0.0021},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.11,"sample":65,"avg":0.184,"obp":0.289,"slg":0.318,"k_pct":0.192,"bb_pct":0.106,"hard_hit":0.375,"outcomes":{"1B":0.0994,"2B":0.0546,"3B":0.0093,"HR":0.0203,"BB":0.1056,"K":0.1924,"OUT":0.4686,"GIDP":0.0314,"HBP":0.0174,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0623,"sample":64,"avg":0.178,"obp":0.252,"slg":0.247,"k_pct":0.196,"bb_pct":0.074,"hard_hit":0.378,"outcomes":{"1B":0.1299,"2B":0.0369,"3B":0.001,"HR":0.0101,"BB":0.0745,"K":0.196,"OUT":0.4809,"GIDP":0.0558,"HBP":0.0139,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":17,"avg":0.159,"obp":0.239,"slg":0.239,"k_pct":0.208,"bb_pct":0.08,"hard_hit":0.349,"outcomes":{"1B":0.1028,"2B":0.0419,"3B":0.0041,"HR":0.0101,"BB":0.0803,"K":0.2078,"OUT":0.4598,"GIDP":0.0538,"HBP":0.0242,"SF":0.0152},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":527,"avg":0.239,"obp":0.308,"slg":0.356,"k_pct":0.183,"bb_pct":0.073,"hard_hit":0.424}},"661403":{"pitch_mix":{"FF":0.3701,"SL":0.257,"CH":0.1307,"CU":0.1468,"FC":0.0745,"SI":0.0209},"vs_pitch":{"FF":{"pct":0.3701,"sample":248,"avg":0.271,"obp":0.336,"slg":0.439,"k_pct":0.169,"bb_pct":0.065,"hard_hit":0.367,"outcomes":{"1B":0.168,"2B":0.0611,"3B":0.0179,"HR":0.0237,"BB":0.0654,"K":0.1686,"OUT":0.4394,"GIDP":0.03,"HBP":0.0249,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0209,"sample":10,"avg":0.205,"obp":0.268,"slg":0.298,"k_pct":0.166,"bb_pct":0.063,"hard_hit":0.305,"outcomes":{"1B":0.1471,"2B":0.0315,"3B":0.0163,"HR":0.0098,"BB":0.0633,"K":0.1656,"OUT":0.4918,"GIDP":0.0502,"HBP":0.023,"SF":0.0014},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1307,"sample":78,"avg":0.209,"obp":0.284,"slg":0.31,"k_pct":0.193,"bb_pct":0.075,"hard_hit":0.309,"outcomes":{"1B":0.148,"2B":0.0305,"3B":0.0204,"HR":0.01,"BB":0.0755,"K":0.1927,"OUT":0.452,"GIDP":0.0507,"HBP":0.0046,"SF":0.0156},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.257,"sample":174,"avg":0.195,"obp":0.276,"slg":0.313,"k_pct":0.235,"bb_pct":0.081,"hard_hit":0.392,"outcomes":{"1B":0.1217,"2B":0.0391,"3B":0.0245,"HR":0.01,"BB":0.0805,"K":0.2347,"OUT":0.4332,"GIDP":0.0543,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1468,"sample":63,"avg":0.14,"obp":0.234,"slg":0.201,"k_pct":0.242,"bb_pct":0.094,"hard_hit":0.412,"outcomes":{"1B":0.0993,"2B":0.0293,"3B":0.0011,"HR":0.0099,"BB":0.0941,"K":0.2424,"OUT":0.4687,"GIDP":0.0271,"HBP":0.0272,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0745,"sample":32,"avg":0.195,"obp":0.26,"slg":0.271,"k_pct":0.205,"bb_pct":0.065,"hard_hit":0.394,"outcomes":{"1B":0.14,"2B":0.0443,"3B":0.001,"HR":0.0099,"BB":0.0652,"K":0.2051,"OUT":0.4616,"GIDP":0.0576,"HBP":0.0051,"SF":0.0103},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":14,"avg":0.194,"obp":0.269,"slg":0.303,"k_pct":0.233,"bb_pct":0.076,"hard_hit":0.362,"outcomes":{"1B":0.1204,"2B":0.0467,"3B":0.0164,"HR":0.0101,"BB":0.0757,"K":0.2329,"OUT":0.445,"GIDP":0.0509,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":479,"avg":0.239,"obp":0.307,"slg":0.374,"k_pct":0.202,"bb_pct":0.075,"hard_hit":0.473}},"666201":{"pitch_mix":{"SI":0.39,"FF":0.2067,"CH":0.1905,"SL":0.1565,"CU":0.0465,"FC":0.0099},"vs_pitch":{"FF":{"pct":0.2067,"sample":131,"avg":0.225,"obp":0.285,"slg":0.317,"k_pct":0.157,"bb_pct":0.06,"hard_hit":0.336,"outcomes":{"1B":0.1555,"2B":0.0565,"3B":0.0032,"HR":0.0098,"BB":0.0604,"K":0.1574,"OUT":0.4891,"GIDP":0.0418,"HBP":0.019,"SF":0.0073},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.39,"sample":222,"avg":0.232,"obp":0.31,"slg":0.324,"k_pct":0.134,"bb_pct":0.078,"hard_hit":0.334,"outcomes":{"1B":0.1704,"2B":0.0414,"3B":0.0103,"HR":0.0099,"BB":0.0779,"K":0.1343,"OUT":0.4969,"GIDP":0.0568,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1905,"sample":105,"avg":0.19,"obp":0.287,"slg":0.274,"k_pct":0.169,"bb_pct":0.097,"hard_hit":0.434,"outcomes":{"1B":0.1332,"2B":0.0429,"3B":0.0011,"HR":0.0128,"BB":0.097,"K":0.1693,"OUT":0.4977,"GIDP":0.0371,"HBP":0.0078,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1565,"sample":83,"avg":0.179,"obp":0.235,"slg":0.265,"k_pct":0.196,"bb_pct":0.056,"hard_hit":0.346,"outcomes":{"1B":0.1214,"2B":0.0391,"3B":0.0087,"HR":0.0098,"BB":0.0557,"K":0.1964,"OUT":0.4917,"GIDP":0.0609,"HBP":0.0153,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0465,"sample":17,"avg":0.173,"obp":0.257,"slg":0.272,"k_pct":0.201,"bb_pct":0.084,"hard_hit":0.337,"outcomes":{"1B":0.1073,"2B":0.0424,"3B":0.0133,"HR":0.0099,"BB":0.0836,"K":0.2008,"OUT":0.4968,"GIDP":0.0345,"HBP":0.0104,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.145,"obp":0.208,"slg":0.21,"k_pct":0.233,"bb_pct":0.063,"hard_hit":0.433,"outcomes":{"1B":0.1065,"2B":0.0197,"3B":0.0086,"HR":0.0097,"BB":0.0632,"K":0.2329,"OUT":0.4869,"GIDP":0.0458,"HBP":0.0124,"SF":0.0143},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":543,"avg":0.231,"obp":0.295,"slg":0.329,"k_pct":0.159,"bb_pct":0.075,"hard_hit":0.424}},"596001":{"pitch_mix":{"FF":0.2626,"SI":0.1503,"CH":0.248,"SL":0.1643,"CU":0.1208,"FC":0.0541},"vs_pitch":{"FF":{"pct":0.2626,"sample":182,"avg":0.262,"obp":0.331,"slg":0.401,"k_pct":0.159,"bb_pct":0.068,"hard_hit":0.39,"outcomes":{"1B":0.1795,"2B":0.053,"3B":0.0031,"HR":0.0265,"BB":0.0684,"K":0.1587,"OUT":0.4484,"GIDP":0.0605,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1503,"sample":76,"avg":0.242,"obp":0.313,"slg":0.374,"k_pct":0.116,"bb_pct":0.071,"hard_hit":0.31,"outcomes":{"1B":0.1443,"2B":0.0725,"3B":0.0146,"HR":0.0103,"BB":0.0709,"K":0.116,"OUT":0.4919,"GIDP":0.0664,"HBP":0.0032,"SF":0.01},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.248,"sample":146,"avg":0.213,"obp":0.286,"slg":0.33,"k_pct":0.181,"bb_pct":0.073,"hard_hit":0.309,"outcomes":{"1B":0.1429,"2B":0.0334,"3B":0.0264,"HR":0.0103,"BB":0.0731,"K":0.1812,"OUT":0.4742,"GIDP":0.0544,"HBP":0.0029,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1643,"sample":77,"avg":0.173,"obp":0.238,"slg":0.252,"k_pct":0.215,"bb_pct":0.066,"hard_hit":0.356,"outcomes":{"1B":0.1151,"2B":0.0465,"3B":0.0011,"HR":0.0101,"BB":0.0656,"K":0.2153,"OUT":0.483,"GIDP":0.038,"HBP":0.0011,"SF":0.0242},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1208,"sample":45,"avg":0.161,"obp":0.261,"slg":0.277,"k_pct":0.212,"bb_pct":0.1,"hard_hit":0.344,"outcomes":{"1B":0.0955,"2B":0.0388,"3B":0.001,"HR":0.0252,"BB":0.1002,"K":0.2119,"OUT":0.4657,"GIDP":0.0415,"HBP":0.001,"SF":0.0193},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0541,"sample":18,"avg":0.208,"obp":0.287,"slg":0.299,"k_pct":0.177,"bb_pct":0.079,"hard_hit":0.335,"outcomes":{"1B":0.1556,"2B":0.0236,"3B":0.0184,"HR":0.0103,"BB":0.079,"K":0.1766,"OUT":0.466,"GIDP":0.0362,"HBP":0.012,"SF":0.0224},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.164,"obp":0.249,"slg":0.242,"k_pct":0.23,"bb_pct":0.084,"hard_hit":0.358,"outcomes":{"1B":0.1182,"2B":0.0244,"3B":0.0113,"HR":0.0103,"BB":0.0844,"K":0.2299,"OUT":0.4592,"GIDP":0.0601,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":534,"avg":0.237,"obp":0.293,"slg":0.366,"k_pct":0.175,"bb_pct":0.074,"hard_hit":0.528}},"641482":{"pitch_mix":{"FF":0.2837,"SI":0.1079,"CH":0.2418,"SL":0.138,"CU":0.1189,"FC":0.1097},"vs_pitch":{"FF":{"pct":0.2837,"sample":181,"avg":0.276,"obp":0.346,"slg":0.458,"k_pct":0.151,"bb_pct":0.07,"hard_hit":0.343,"outcomes":{"1B":0.1714,"2B":0.0611,"3B":0.0109,"HR":0.0328,"BB":0.0696,"K":0.151,"OUT":0.4639,"GIDP":0.0362,"HBP":0.0019,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1079,"sample":50,"avg":0.268,"obp":0.328,"slg":0.429,"k_pct":0.128,"bb_pct":0.061,"hard_hit":0.43,"outcomes":{"1B":0.165,"2B":0.0613,"3B":0.0236,"HR":0.0176,"BB":0.0609,"K":0.1281,"OUT":0.4671,"GIDP":0.0742,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2418,"sample":120,"avg":0.201,"obp":0.269,"slg":0.259,"k_pct":0.203,"bb_pct":0.069,"hard_hit":0.297,"outcomes":{"1B":0.1639,"2B":0.0255,"3B":0.0011,"HR":0.0101,"BB":0.0686,"K":0.2029,"OUT":0.4845,"GIDP":0.023,"HBP":0.0043,"SF":0.016},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.138,"sample":54,"avg":0.192,"obp":0.255,"slg":0.294,"k_pct":0.233,"bb_pct":0.063,"hard_hit":0.386,"outcomes":{"1B":0.1332,"2B":0.0248,"3B":0.0236,"HR":0.0102,"BB":0.0628,"K":0.233,"OUT":0.4752,"GIDP":0.0266,"HBP":0.0096,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1189,"sample":79,"avg":0.189,"obp":0.281,"slg":0.311,"k_pct":0.192,"bb_pct":0.092,"hard_hit":0.353,"outcomes":{"1B":0.1248,"2B":0.0332,"3B":0.004,"HR":0.0269,"BB":0.0922,"K":0.1921,"OUT":0.4507,"GIDP":0.0592,"HBP":0.016,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1097,"sample":61,"avg":0.232,"obp":0.306,"slg":0.343,"k_pct":0.194,"bb_pct":0.074,"hard_hit":0.322,"outcomes":{"1B":0.1562,"2B":0.0573,"3B":0.0025,"HR":0.0163,"BB":0.0742,"K":0.1938,"OUT":0.4674,"GIDP":0.0302,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.163,"obp":0.239,"slg":0.267,"k_pct":0.226,"bb_pct":0.076,"hard_hit":0.403,"outcomes":{"1B":0.1161,"2B":0.0103,"3B":0.0172,"HR":0.0196,"BB":0.0763,"K":0.2264,"OUT":0.4453,"GIDP":0.0589,"HBP":0.0268,"SF":0.0032},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":494,"avg":0.25,"obp":0.306,"slg":0.385,"k_pct":0.182,"bb_pct":0.071,"hard_hit":0.469}},"663511":{"pitch_mix":{"FF":0.5393,"SI":0.0832,"SL":0.1737,"CH":0.1295,"CU":0.0545,"FC":0.0198},"vs_pitch":{"FF":{"pct":0.5393,"sample":310,"avg":0.244,"obp":0.305,"slg":0.365,"k_pct":0.206,"bb_pct":0.061,"hard_hit":0.326,"outcomes":{"1B":0.1615,"2B":0.0536,"3B":0.0193,"HR":0.0096,"BB":0.0606,"K":0.2065,"OUT":0.4129,"GIDP":0.0499,"HBP":0.0139,"SF":0.0123},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0832,"sample":31,"avg":0.238,"obp":0.283,"slg":0.366,"k_pct":0.176,"bb_pct":0.046,"hard_hit":0.331,"outcomes":{"1B":0.1539,"2B":0.0601,"3B":0.0024,"HR":0.0213,"BB":0.0456,"K":0.1756,"OUT":0.4682,"GIDP":0.0624,"HBP":0.001,"SF":0.0095},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1295,"sample":60,"avg":0.226,"obp":0.301,"slg":0.383,"k_pct":0.22,"bb_pct":0.074,"hard_hit":0.335,"outcomes":{"1B":0.1329,"2B":0.0614,"3B":0.0011,"HR":0.0309,"BB":0.0744,"K":0.2199,"OUT":0.4563,"GIDP":0.0212,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1737,"sample":78,"avg":0.183,"obp":0.259,"slg":0.306,"k_pct":0.245,"bb_pct":0.075,"hard_hit":0.367,"outcomes":{"1B":0.1029,"2B":0.0479,"3B":0.023,"HR":0.0096,"BB":0.0753,"K":0.2452,"OUT":0.4277,"GIDP":0.0535,"HBP":0.001,"SF":0.0139},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0545,"sample":10,"avg":0.159,"obp":0.227,"slg":0.243,"k_pct":0.269,"bb_pct":0.068,"hard_hit":0.312,"outcomes":{"1B":0.094,"2B":0.0539,"3B":0.001,"HR":0.0096,"BB":0.0681,"K":0.2693,"OUT":0.4429,"GIDP":0.0342,"HBP":0.026,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0198,"sample":16,"avg":0.188,"obp":0.252,"slg":0.262,"k_pct":0.24,"bb_pct":0.063,"hard_hit":0.363,"outcomes":{"1B":0.1446,"2B":0.0229,"3B":0.0112,"HR":0.0096,"BB":0.0634,"K":0.2398,"OUT":0.452,"GIDP":0.0254,"HBP":0.0176,"SF":0.0133},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.166,"obp":0.259,"slg":0.264,"k_pct":0.265,"bb_pct":0.093,"hard_hit":0.374,"outcomes":{"1B":0.1092,"2B":0.0351,"3B":0.001,"HR":0.0205,"BB":0.0935,"K":0.2645,"OUT":0.4295,"GIDP":0.0448,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":521,"avg":0.246,"obp":0.299,"slg":0.38,"k_pct":0.216,"bb_pct":0.064,"hard_hit":0.508}},"657656":{"pitch_mix":{"SI":0.3615,"FF":0.1946,"CH":0.215,"SL":0.1252,"CU":0.0931,"FC":0.0106},"vs_pitch":{"FF":{"pct":0.1946,"sample":136,"avg":0.2,"obp":0.297,"slg":0.298,"k_pct":0.169,"bb_pct":0.097,"hard_hit":0.297,"outcomes":{"1B":0.1433,"2B":0.0362,"3B":0.001,"HR":0.0198,"BB":0.0969,"K":0.1692,"OUT":0.4825,"GIDP":0.0224,"HBP":0.0157,"SF":0.013},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.3615,"sample":202,"avg":0.221,"obp":0.277,"slg":0.325,"k_pct":0.15,"bb_pct":0.056,"hard_hit":0.424,"outcomes":{"1B":0.1542,"2B":0.044,"3B":0.0086,"HR":0.0143,"BB":0.0556,"K":0.1501,"OUT":0.5116,"GIDP":0.0421,"HBP":0.0052,"SF":0.0144},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.215,"sample":157,"avg":0.204,"obp":0.274,"slg":0.302,"k_pct":0.163,"bb_pct":0.07,"hard_hit":0.418,"outcomes":{"1B":0.1453,"2B":0.0388,"3B":0.0011,"HR":0.019,"BB":0.07,"K":0.163,"OUT":0.4928,"GIDP":0.0511,"HBP":0.0011,"SF":0.0178},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1252,"sample":84,"avg":0.163,"obp":0.232,"slg":0.259,"k_pct":0.202,"bb_pct":0.069,"hard_hit":0.417,"outcomes":{"1B":0.1027,"2B":0.04,"3B":0.0029,"HR":0.017,"BB":0.0694,"K":0.2015,"OUT":0.492,"GIDP":0.039,"HBP":0.0168,"SF":0.0187},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0931,"sample":45,"avg":0.174,"obp":0.263,"slg":0.272,"k_pct":0.191,"bb_pct":0.089,"hard_hit":0.346,"outcomes":{"1B":0.1179,"2B":0.0288,"3B":0.0135,"HR":0.0139,"BB":0.0893,"K":0.1907,"OUT":0.4888,"GIDP":0.0389,"HBP":0.0098,"SF":0.0083},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0106,"sample":17,"avg":0.2,"obp":0.298,"slg":0.282,"k_pct":0.175,"bb_pct":0.098,"hard_hit":0.414,"outcomes":{"1B":0.1507,"2B":0.0266,"3B":0.0126,"HR":0.01,"BB":0.0977,"K":0.1754,"OUT":0.4978,"GIDP":0.0271,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":32,"avg":0.176,"obp":0.249,"slg":0.259,"k_pct":0.219,"bb_pct":0.073,"hard_hit":0.413,"outcomes":{"1B":0.1238,"2B":0.0303,"3B":0.0118,"HR":0.0097,"BB":0.073,"K":0.2193,"OUT":0.4716,"GIDP":0.056,"HBP":0.001,"SF":0.0036},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":539,"avg":0.223,"obp":0.282,"slg":0.333,"k_pct":0.167,"bb_pct":0.072,"hard_hit":0.51}},"686428":{"pitch_mix":{"FF":0.4829,"SI":0.0843,"SL":0.2341,"CH":0.0929,"CU":0.0493,"FC":0.0564},"vs_pitch":{"FF":{"pct":0.4829,"sample":271,"avg":0.22,"obp":0.291,"slg":0.291,"k_pct":0.222,"bb_pct":0.071,"hard_hit":0.311,"outcomes":{"1B":0.1698,"2B":0.0398,"3B":0.001,"HR":0.0096,"BB":0.0706,"K":0.2219,"OUT":0.4392,"GIDP":0.0234,"HBP":0.0186,"SF":0.0061},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0843,"sample":47,"avg":0.222,"obp":0.279,"slg":0.343,"k_pct":0.186,"bb_pct":0.057,"hard_hit":0.421,"outcomes":{"1B":0.142,"2B":0.0483,"3B":0.0219,"HR":0.0097,"BB":0.057,"K":0.1863,"OUT":0.4494,"GIDP":0.0577,"HBP":0.0155,"SF":0.012},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.0929,"sample":45,"avg":0.171,"obp":0.239,"slg":0.232,"k_pct":0.253,"bb_pct":0.068,"hard_hit":0.415,"outcomes":{"1B":0.131,"2B":0.0279,"3B":0.0021,"HR":0.0097,"BB":0.068,"K":0.2526,"OUT":0.4485,"GIDP":0.0349,"HBP":0.0011,"SF":0.0242},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2341,"sample":138,"avg":0.185,"obp":0.243,"slg":0.293,"k_pct":0.264,"bb_pct":0.058,"hard_hit":0.352,"outcomes":{"1B":0.1138,"2B":0.0442,"3B":0.0176,"HR":0.0096,"BB":0.0581,"K":0.2639,"OUT":0.4336,"GIDP":0.0409,"HBP":0.0174,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0493,"sample":10,"avg":0.18,"obp":0.266,"slg":0.306,"k_pct":0.266,"bb_pct":0.086,"hard_hit":0.403,"outcomes":{"1B":0.0998,"2B":0.0465,"3B":0.023,"HR":0.011,"BB":0.0859,"K":0.2664,"OUT":0.4188,"GIDP":0.0303,"HBP":0.001,"SF":0.0173},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0564,"sample":59,"avg":0.238,"obp":0.309,"slg":0.363,"k_pct":0.227,"bb_pct":0.071,"hard_hit":0.373,"outcomes":{"1B":0.1544,"2B":0.0517,"3B":0.0213,"HR":0.0103,"BB":0.0713,"K":0.2273,"OUT":0.4243,"GIDP":0.0376,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":20,"avg":0.15,"obp":0.24,"slg":0.221,"k_pct":0.27,"bb_pct":0.09,"hard_hit":0.392,"outcomes":{"1B":0.1005,"2B":0.0393,"3B":0.001,"HR":0.0096,"BB":0.0896,"K":0.2702,"OUT":0.4251,"GIDP":0.0479,"HBP":0.001,"SF":0.0158},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":444,"avg":0.227,"obp":0.288,"slg":0.324,"k_pct":0.234,"bb_pct":0.067,"hard_hit":0.469}},"666214":{"pitch_mix":{"FF":0.5245,"SI":0.1025,"SL":0.2145,"CH":0.069,"CU":0.0255,"FC":0.0642},"vs_pitch":{"FF":{"pct":0.5245,"sample":308,"avg":0.24,"obp":0.331,"slg":0.392,"k_pct":0.192,"bb_pct":0.091,"hard_hit":0.289,"outcomes":{"1B":0.1476,"2B":0.0602,"3B":0.0035,"HR":0.0284,"BB":0.091,"K":0.1918,"OUT":0.4188,"GIDP":0.0423,"HBP":0.001,"SF":0.0154},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1025,"sample":67,"avg":0.199,"obp":0.262,"slg":0.283,"k_pct":0.166,"bb_pct":0.064,"hard_hit":0.361,"outcomes":{"1B":0.1408,"2B":0.04,"3B":0.0081,"HR":0.0096,"BB":0.0635,"K":0.1664,"OUT":0.4557,"GIDP":0.0748,"HBP":0.0269,"SF":0.0141},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.069,"sample":60,"avg":0.187,"obp":0.256,"slg":0.254,"k_pct":0.244,"bb_pct":0.068,"hard_hit":0.392,"outcomes":{"1B":0.1417,"2B":0.0341,"3B":0.0019,"HR":0.0096,"BB":0.0684,"K":0.2442,"OUT":0.4558,"GIDP":0.0389,"HBP":0.0011,"SF":0.0044},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2145,"sample":125,"avg":0.174,"obp":0.244,"slg":0.242,"k_pct":0.262,"bb_pct":0.07,"hard_hit":0.332,"outcomes":{"1B":0.1256,"2B":0.0377,"3B":0.001,"HR":0.0096,"BB":0.0702,"K":0.2622,"OUT":0.4523,"GIDP":0.0395,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0255,"sample":24,"avg":0.171,"obp":0.255,"slg":0.248,"k_pct":0.249,"bb_pct":0.083,"hard_hit":0.411,"outcomes":{"1B":0.1266,"2B":0.0234,"3B":0.0118,"HR":0.0097,"BB":0.0833,"K":0.2495,"OUT":0.4507,"GIDP":0.0208,"HBP":0.001,"SF":0.0233},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0642,"sample":23,"avg":0.222,"obp":0.28,"slg":0.35,"k_pct":0.232,"bb_pct":0.058,"hard_hit":0.432,"outcomes":{"1B":0.1488,"2B":0.0439,"3B":0.0025,"HR":0.0264,"BB":0.058,"K":0.2317,"OUT":0.4264,"GIDP":0.0481,"HBP":0.001,"SF":0.0133},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.202,"obp":0.286,"slg":0.306,"k_pct":0.255,"bb_pct":0.085,"hard_hit":0.367,"outcomes":{"1B":0.1326,"2B":0.0432,"3B":0.0162,"HR":0.0095,"BB":0.0847,"K":0.2546,"OUT":0.4326,"GIDP":0.0202,"HBP":0.001,"SF":0.0053},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":486,"avg":0.237,"obp":0.298,"slg":0.368,"k_pct":0.212,"bb_pct":0.08,"hard_hit":0.46}},"682243":{"pitch_mix":{"FF":0.4813,"SI":0.1084,"SL":0.1958,"CH":0.1031,"CU":0.0455,"FC":0.0658},"vs_pitch":{"FF":{"pct":0.4813,"sample":300,"avg":0.213,"obp":0.301,"slg":0.284,"k_pct":0.199,"bb_pct":0.088,"hard_hit":0.416,"outcomes":{"1B":0.1622,"2B":0.0403,"3B":0.001,"HR":0.0096,"BB":0.0881,"K":0.199,"OUT":0.4294,"GIDP":0.0579,"HBP":0.001,"SF":0.0115},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1084,"sample":90,"avg":0.233,"obp":0.296,"slg":0.362,"k_pct":0.172,"bb_pct":0.063,"hard_hit":0.376,"outcomes":{"1B":0.1491,"2B":0.0617,"3B":0.001,"HR":0.0216,"BB":0.063,"K":0.1721,"OUT":0.4541,"GIDP":0.0755,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1031,"sample":32,"avg":0.19,"obp":0.279,"slg":0.306,"k_pct":0.21,"bb_pct":0.089,"hard_hit":0.335,"outcomes":{"1B":0.1244,"2B":0.028,"3B":0.0248,"HR":0.0127,"BB":0.0887,"K":0.2101,"OUT":0.4578,"GIDP":0.0322,"HBP":0.0076,"SF":0.0138},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1958,"sample":88,"avg":0.168,"obp":0.232,"slg":0.276,"k_pct":0.263,"bb_pct":0.064,"hard_hit":0.431,"outcomes":{"1B":0.1037,"2B":0.0414,"3B":0.0009,"HR":0.0217,"BB":0.0644,"K":0.2626,"OUT":0.4179,"GIDP":0.0507,"HBP":0.0217,"SF":0.0152},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0455,"sample":23,"avg":0.161,"obp":0.233,"slg":0.219,"k_pct":0.258,"bb_pct":0.072,"hard_hit":0.318,"outcomes":{"1B":0.1223,"2B":0.0278,"3B":0.001,"HR":0.0096,"BB":0.0722,"K":0.258,"OUT":0.4312,"GIDP":0.0451,"HBP":0.0219,"SF":0.011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0658,"sample":28,"avg":0.212,"obp":0.282,"slg":0.34,"k_pct":0.213,"bb_pct":0.07,"hard_hit":0.39,"outcomes":{"1B":0.1237,"2B":0.0575,"3B":0.0209,"HR":0.0096,"BB":0.0701,"K":0.2127,"OUT":0.4261,"GIDP":0.0407,"HBP":0.0205,"SF":0.0181},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":22,"avg":0.191,"obp":0.276,"slg":0.295,"k_pct":0.27,"bb_pct":0.085,"hard_hit":0.299,"outcomes":{"1B":0.1266,"2B":0.0434,"3B":0.0012,"HR":0.0196,"BB":0.085,"K":0.27,"OUT":0.4237,"GIDP":0.0247,"HBP":0.001,"SF":0.005},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":501,"avg":0.224,"obp":0.288,"slg":0.326,"k_pct":0.213,"bb_pct":0.079,"hard_hit":0.518}},"669456":{"pitch_mix":{"FF":0.3798,"SL":0.217,"CH":0.1385,"CU":0.1613,"FC":0.0888,"SI":0.0146},"vs_pitch":{"FF":{"pct":0.3798,"sample":235,"avg":0.276,"obp":0.344,"slg":0.442,"k_pct":0.171,"bb_pct":0.068,"hard_hit":0.371,"outcomes":{"1B":0.174,"2B":0.0642,"3B":0.0127,"HR":0.0253,"BB":0.0675,"K":0.1705,"OUT":0.4243,"GIDP":0.0215,"HBP":0.0301,"SF":0.0099},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0146,"sample":32,"avg":0.204,"obp":0.272,"slg":0.3,"k_pct":0.16,"bb_pct":0.068,"hard_hit":0.342,"outcomes":{"1B":0.1406,"2B":0.0396,"3B":0.0136,"HR":0.0099,"BB":0.0681,"K":0.1599,"OUT":0.4839,"GIDP":0.0647,"HBP":0.0187,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1385,"sample":66,"avg":0.178,"obp":0.277,"slg":0.236,"k_pct":0.218,"bb_pct":0.099,"hard_hit":0.291,"outcomes":{"1B":0.1398,"2B":0.0267,"3B":0.001,"HR":0.01,"BB":0.0993,"K":0.2178,"OUT":0.4604,"GIDP":0.0291,"HBP":0.0149,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.217,"sample":124,"avg":0.222,"obp":0.284,"slg":0.349,"k_pct":0.234,"bb_pct":0.062,"hard_hit":0.395,"outcomes":{"1B":0.1344,"2B":0.0584,"3B":0.0193,"HR":0.0099,"BB":0.0619,"K":0.2344,"OUT":0.4321,"GIDP":0.0355,"HBP":0.001,"SF":0.0131},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1613,"sample":122,"avg":0.182,"obp":0.278,"slg":0.285,"k_pct":0.239,"bb_pct":0.096,"hard_hit":0.439,"outcomes":{"1B":0.1062,"2B":0.0578,"3B":0.0079,"HR":0.01,"BB":0.0961,"K":0.2389,"OUT":0.4332,"GIDP":0.0245,"HBP":0.0063,"SF":0.0192},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0888,"sample":75,"avg":0.216,"obp":0.29,"slg":0.325,"k_pct":0.215,"bb_pct":0.074,"hard_hit":0.326,"outcomes":{"1B":0.1494,"2B":0.0378,"3B":0.0152,"HR":0.0135,"BB":0.0745,"K":0.2147,"OUT":0.4553,"GIDP":0.0334,"HBP":0.0052,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":13,"avg":0.163,"obp":0.259,"slg":0.265,"k_pct":0.25,"bb_pct":0.097,"hard_hit":0.43,"outcomes":{"1B":0.1073,"2B":0.0219,"3B":0.0209,"HR":0.0127,"BB":0.0966,"K":0.2496,"OUT":0.4581,"GIDP":0.0237,"HBP":0.0081,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":559,"avg":0.255,"obp":0.321,"slg":0.396,"k_pct":0.206,"bb_pct":0.076,"hard_hit":0.377}},"665296":{"pitch_mix":{"FF":0.2833,"SI":0.1204,"CH":0.2016,"SL":0.1735,"CU":0.1629,"FC":0.0583},"vs_pitch":{"FF":{"pct":0.2833,"sample":172,"avg":0.26,"obp":0.357,"slg":0.433,"k_pct":0.168,"bb_pct":0.097,"hard_hit":0.393,"outcomes":{"1B":0.1681,"2B":0.0424,"3B":0.0156,"HR":0.0334,"BB":0.0973,"K":0.1681,"OUT":0.4396,"GIDP":0.026,"HBP":0.0085,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1204,"sample":52,"avg":0.252,"obp":0.315,"slg":0.373,"k_pct":0.113,"bb_pct":0.063,"hard_hit":0.419,"outcomes":{"1B":0.1611,"2B":0.0699,"3B":0.0107,"HR":0.0101,"BB":0.0628,"K":0.1132,"OUT":0.4731,"GIDP":0.0541,"HBP":0.0252,"SF":0.0198},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2016,"sample":129,"avg":0.206,"obp":0.304,"slg":0.295,"k_pct":0.182,"bb_pct":0.099,"hard_hit":0.402,"outcomes":{"1B":0.1396,"2B":0.0527,"3B":0.0031,"HR":0.0102,"BB":0.0987,"K":0.1825,"OUT":0.4841,"GIDP":0.0268,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1735,"sample":112,"avg":0.174,"obp":0.253,"slg":0.284,"k_pct":0.223,"bb_pct":0.079,"hard_hit":0.376,"outcomes":{"1B":0.1075,"2B":0.0425,"3B":0.0053,"HR":0.0188,"BB":0.0791,"K":0.223,"OUT":0.4664,"GIDP":0.0493,"HBP":0.0065,"SF":0.0018},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1629,"sample":109,"avg":0.171,"obp":0.28,"slg":0.269,"k_pct":0.192,"bb_pct":0.108,"hard_hit":0.372,"outcomes":{"1B":0.1057,"2B":0.0441,"3B":0.0103,"HR":0.0111,"BB":0.1085,"K":0.1918,"OUT":0.4595,"GIDP":0.0487,"HBP":0.001,"SF":0.0192},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0583,"sample":39,"avg":0.199,"obp":0.294,"slg":0.267,"k_pct":0.165,"bb_pct":0.095,"hard_hit":0.308,"outcomes":{"1B":0.1531,"2B":0.0351,"3B":0.001,"HR":0.0101,"BB":0.0948,"K":0.1653,"OUT":0.4663,"GIDP":0.049,"HBP":0.018,"SF":0.0073},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.193,"obp":0.269,"slg":0.303,"k_pct":0.226,"bb_pct":0.076,"hard_hit":0.355,"outcomes":{"1B":0.1255,"2B":0.035,"3B":0.0224,"HR":0.0101,"BB":0.0758,"K":0.2263,"OUT":0.4692,"GIDP":0.024,"HBP":0.0054,"SF":0.0064},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":451,"avg":0.241,"obp":0.315,"slg":0.376,"k_pct":0.178,"bb_pct":0.092,"hard_hit":0.489}},"660271":{"pitch_mix":{"FF":0.5516,"SI":0.0464,"SL":0.2109,"CH":0.1089,"CU":0.0426,"FC":0.0395},"vs_pitch":{"FF":{"pct":0.5516,"sample":332,"avg":0.221,"obp":0.31,"slg":0.29,"k_pct":0.214,"bb_pct":0.089,"hard_hit":0.305,"outcomes":{"1B":0.1732,"2B":0.0376,"3B":0.001,"HR":0.0096,"BB":0.0888,"K":0.2142,"OUT":0.4338,"GIDP":0.0367,"HBP":0.001,"SF":0.0042},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0464,"sample":10,"avg":0.212,"obp":0.262,"slg":0.327,"k_pct":0.191,"bb_pct":0.05,"hard_hit":0.396,"outcomes":{"1B":0.1355,"2B":0.0466,"3B":0.0198,"HR":0.0096,"BB":0.0502,"K":0.1909,"OUT":0.4388,"GIDP":0.075,"HBP":0.0101,"SF":0.0234},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1089,"sample":68,"avg":0.202,"obp":0.298,"slg":0.292,"k_pct":0.233,"bb_pct":0.096,"hard_hit":0.403,"outcomes":{"1B":0.1375,"2B":0.048,"3B":0.0068,"HR":0.0095,"BB":0.0962,"K":0.2326,"OUT":0.4387,"GIDP":0.0232,"HBP":0.0066,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2109,"sample":113,"avg":0.177,"obp":0.235,"slg":0.26,"k_pct":0.255,"bb_pct":0.058,"hard_hit":0.304,"outcomes":{"1B":0.1297,"2B":0.0208,"3B":0.0152,"HR":0.0108,"BB":0.0582,"K":0.2553,"OUT":0.4393,"GIDP":0.0411,"HBP":0.0188,"SF":0.0108},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0426,"sample":10,"avg":0.149,"obp":0.231,"slg":0.22,"k_pct":0.261,"bb_pct":0.082,"hard_hit":0.307,"outcomes":{"1B":0.1071,"2B":0.0216,"3B":0.0104,"HR":0.0097,"BB":0.0819,"K":0.2613,"OUT":0.4632,"GIDP":0.0269,"HBP":0.0169,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0395,"sample":38,"avg":0.212,"obp":0.265,"slg":0.312,"k_pct":0.25,"bb_pct":0.053,"hard_hit":0.375,"outcomes":{"1B":0.1385,"2B":0.0575,"3B":0.0069,"HR":0.0095,"BB":0.0529,"K":0.2496,"OUT":0.4464,"GIDP":0.0365,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":24,"avg":0.172,"obp":0.238,"slg":0.263,"k_pct":0.271,"bb_pct":0.066,"hard_hit":0.402,"outcomes":{"1B":0.1119,"2B":0.0397,"3B":0.011,"HR":0.0097,"BB":0.0662,"K":0.2707,"OUT":0.4187,"GIDP":0.0428,"HBP":0.0085,"SF":0.0209},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":565,"avg":0.227,"obp":0.292,"slg":0.312,"k_pct":0.227,"bb_pct":0.08,"hard_hit":0.376}},"593423":{"pitch_mix":{"FF":0.2814,"SI":0.1417,"CH":0.2006,"SL":0.1443,"CU":0.1428,"FC":0.0893},"vs_pitch":{"FF":{"pct":0.2814,"sample":194,"avg":0.231,"obp":0.317,"slg":0.362,"k_pct":0.169,"bb_pct":0.086,"hard_hit":0.332,"outcomes":{"1B":0.1605,"2B":0.0398,"3B":0.001,"HR":0.0297,"BB":0.0859,"K":0.1689,"OUT":0.4318,"GIDP":0.0487,"HBP":0.0168,"SF":0.0168},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1417,"sample":100,"avg":0.206,"obp":0.285,"slg":0.274,"k_pct":0.129,"bb_pct":0.079,"hard_hit":0.407,"outcomes":{"1B":0.1604,"2B":0.0348,"3B":0.001,"HR":0.0103,"BB":0.0788,"K":0.1294,"OUT":0.5058,"GIDP":0.0672,"HBP":0.011,"SF":0.0013},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2006,"sample":111,"avg":0.216,"obp":0.294,"slg":0.336,"k_pct":0.172,"bb_pct":0.079,"hard_hit":0.313,"outcomes":{"1B":0.1379,"2B":0.0476,"3B":0.0184,"HR":0.0118,"BB":0.0788,"K":0.1725,"OUT":0.4607,"GIDP":0.0434,"HBP":0.0279,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1443,"sample":109,"avg":0.2,"obp":0.264,"slg":0.317,"k_pct":0.219,"bb_pct":0.064,"hard_hit":0.358,"outcomes":{"1B":0.1281,"2B":0.0374,"3B":0.0244,"HR":0.0103,"BB":0.064,"K":0.2191,"OUT":0.4395,"GIDP":0.0471,"HBP":0.0177,"SF":0.0125},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1428,"sample":79,"avg":0.186,"obp":0.266,"slg":0.305,"k_pct":0.225,"bb_pct":0.08,"hard_hit":0.332,"outcomes":{"1B":0.1174,"2B":0.0398,"3B":0.0074,"HR":0.0215,"BB":0.0796,"K":0.2254,"OUT":0.4471,"GIDP":0.0252,"HBP":0.0212,"SF":0.0154},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0893,"sample":41,"avg":0.186,"obp":0.262,"slg":0.242,"k_pct":0.187,"bb_pct":0.076,"hard_hit":0.342,"outcomes":{"1B":0.1518,"2B":0.0234,"3B":0.001,"HR":0.0102,"BB":0.076,"K":0.1871,"OUT":0.4801,"GIDP":0.0522,"HBP":0.0161,"SF":0.0022},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.16,"obp":0.242,"slg":0.231,"k_pct":0.234,"bb_pct":0.082,"hard_hit":0.438,"outcomes":{"1B":0.1213,"2B":0.0176,"3B":0.0112,"HR":0.0102,"BB":0.082,"K":0.2342,"OUT":0.4379,"GIDP":0.0572,"HBP":0.0053,"SF":0.0231},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":569,"avg":0.235,"obp":0.307,"slg":0.357,"k_pct":0.181,"bb_pct":0.079,"hard_hit":0.352}},"622491":{"pitch_mix":{"FF":0.3873,"CH":0.1966,"SL":0.1535,"FC":0.1263,"CU":0.0915,"SI":0.0449},"vs_pitch":{"FF":{"pct":0.3873,"sample":226,"avg":0.239,"obp":0.337,"slg":0.372,"k_pct":0.171,"bb_pct":0.098,"hard_hit":0.345,"outcomes":{"1B":0.1477,"2B":0.0604,"3B":0.0206,"HR":0.0103,"BB":0.098,"K":0.1709,"OUT":0.4353,"GIDP":0.0499,"HBP":0.006,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0449,"sample":10,"avg":0.206,"obp":0.271,"slg":0.279,"k_pct":0.15,"bb_pct":0.065,"hard_hit":0.301,"outcomes":{"1B":0.1549,"2B":0.0403,"3B":0.001,"HR":0.0101,"BB":0.0651,"K":0.1504,"OUT":0.4965,"GIDP":0.0593,"HBP":0.0016,"SF":0.0208},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1966,"sample":137,"avg":0.186,"obp":0.271,"slg":0.274,"k_pct":0.208,"bb_pct":0.085,"hard_hit":0.391,"outcomes":{"1B":0.136,"2B":0.0226,"3B":0.0163,"HR":0.011,"BB":0.0848,"K":0.2077,"OUT":0.4639,"GIDP":0.0501,"HBP":0.0051,"SF":0.0025},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1535,"sample":108,"avg":0.203,"obp":0.288,"slg":0.286,"k_pct":0.213,"bb_pct":0.086,"hard_hit":0.318,"outcomes":{"1B":0.1426,"2B":0.0465,"3B":0.0033,"HR":0.0102,"BB":0.0858,"K":0.2129,"OUT":0.4552,"GIDP":0.0384,"HBP":0.001,"SF":0.0041},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0915,"sample":33,"avg":0.167,"obp":0.279,"slg":0.249,"k_pct":0.207,"bb_pct":0.112,"hard_hit":0.397,"outcomes":{"1B":0.1127,"2B":0.0373,"3B":0.0071,"HR":0.0102,"BB":0.1117,"K":0.2075,"OUT":0.469,"GIDP":0.0251,"HBP":0.0075,"SF":0.0119},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1263,"sample":87,"avg":0.227,"obp":0.3,"slg":0.344,"k_pct":0.176,"bb_pct":0.073,"hard_hit":0.292,"outcomes":{"1B":0.1454,"2B":0.056,"3B":0.0154,"HR":0.0102,"BB":0.0728,"K":0.1761,"OUT":0.468,"GIDP":0.0307,"HBP":0.0146,"SF":0.0108},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.18,"obp":0.254,"slg":0.254,"k_pct":0.233,"bb_pct":0.074,"hard_hit":0.336,"outcomes":{"1B":0.1262,"2B":0.0423,"3B":0.001,"HR":0.0101,"BB":0.0743,"K":0.2329,"OUT":0.4522,"GIDP":0.0408,"HBP":0.0068,"SF":0.0134},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":495,"avg":0.237,"obp":0.31,"slg":0.357,"k_pct":0.188,"bb_pct":0.09,"hard_hit":0.408}},"607072":{"pitch_mix":{"FF":0.2999,"CH":0.2315,"SL":0.198,"FC":0.1566,"CU":0.1041,"SI":0.0099},"vs_pitch":{"FF":{"pct":0.2999,"sample":166,"avg":0.243,"obp":0.34,"slg":0.393,"k_pct":0.163,"bb_pct":0.097,"hard_hit":0.32,"outcomes":{"1B":0.1671,"2B":0.0386,"3B":0.001,"HR":0.0365,"BB":0.0969,"K":0.1626,"OUT":0.4422,"GIDP":0.0244,"HBP":0.0107,"SF":0.02},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2315,"sample":156,"avg":0.196,"obp":0.258,"slg":0.261,"k_pct":0.192,"bb_pct":0.062,"hard_hit":0.439,"outcomes":{"1B":0.1535,"2B":0.0299,"3B":0.001,"HR":0.0111,"BB":0.0624,"K":0.1924,"OUT":0.4661,"GIDP":0.0445,"HBP":0.0212,"SF":0.0178},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.198,"sample":98,"avg":0.181,"obp":0.242,"slg":0.25,"k_pct":0.229,"bb_pct":0.061,"hard_hit":0.354,"outcomes":{"1B":0.1364,"2B":0.0307,"3B":0.0027,"HR":0.011,"BB":0.0608,"K":0.2285,"OUT":0.4622,"GIDP":0.0476,"HBP":0.019,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1041,"sample":50,"avg":0.202,"obp":0.284,"slg":0.367,"k_pct":0.214,"bb_pct":0.082,"hard_hit":0.428,"outcomes":{"1B":0.1125,"2B":0.0403,"3B":0.0236,"HR":0.0257,"BB":0.0819,"K":0.2139,"OUT":0.4597,"GIDP":0.0314,"HBP":0.0095,"SF":0.0014},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1566,"sample":117,"avg":0.224,"obp":0.275,"slg":0.368,"k_pct":0.186,"bb_pct":0.051,"hard_hit":0.324,"outcomes":{"1B":0.1367,"2B":0.0469,"3B":0.0234,"HR":0.0169,"BB":0.0514,"K":0.186,"OUT":0.4537,"GIDP":0.058,"HBP":0.0063,"SF":0.0206},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":19,"avg":0.167,"obp":0.247,"slg":0.243,"k_pct":0.232,"bb_pct":0.08,"hard_hit":0.39,"outcomes":{"1B":0.113,"2B":0.043,"3B":0.001,"HR":0.0103,"BB":0.0801,"K":0.2317,"OUT":0.4489,"GIDP":0.0478,"HBP":0.0192,"SF":0.0049},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":466,"avg":0.236,"obp":0.299,"slg":0.363,"k_pct":0.192,"bb_pct":0.073,"hard_hit":0.413}},"666157":{"pitch_mix":{"FF":0.4024,"SL":0.2349,"CH":0.1287,"CU":0.1259,"FC":0.058,"SI":0.05},"vs_pitch":{"FF":{"pct":0.4024,"sample":218,"avg":0.232,"obp":0.319,"slg":0.324,"k_pct":0.166,"bb_pct":0.087,"hard_hit":0.393,"outcomes":{"1B":0.1598,"2B":0.0609,"3B":0.001,"HR":0.0099,"BB":0.0874,"K":0.166,"OUT":0.4473,"GIDP":0.0575,"HBP":0.001,"SF":0.0093},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.05,"sample":29,"avg":0.204,"obp":0.276,"slg":0.307,"k_pct":0.157,"bb_pct":0.073,"hard_hit":0.386,"outcomes":{"1B":0.1279,"2B":0.0614,"3B":0.001,"HR":0.0132,"BB":0.0726,"K":0.1568,"OUT":0.4766,"GIDP":0.0725,"HBP":0.017,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1287,"sample":50,"avg":0.207,"obp":0.294,"slg":0.358,"k_pct":0.206,"bb_pct":0.087,"hard_hit":0.341,"outcomes":{"1B":0.1225,"2B":0.038,"3B":0.0257,"HR":0.0207,"BB":0.0874,"K":0.2061,"OUT":0.4492,"GIDP":0.0302,"HBP":0.0192,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2349,"sample":119,"avg":0.171,"obp":0.239,"slg":0.27,"k_pct":0.241,"bb_pct":0.068,"hard_hit":0.367,"outcomes":{"1B":0.1147,"2B":0.0226,"3B":0.0234,"HR":0.0099,"BB":0.0681,"K":0.241,"OUT":0.4709,"GIDP":0.0448,"HBP":0.001,"SF":0.0037},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1259,"sample":76,"avg":0.171,"obp":0.255,"slg":0.25,"k_pct":0.22,"bb_pct":0.084,"hard_hit":0.304,"outcomes":{"1B":0.1132,"2B":0.0466,"3B":0.0011,"HR":0.01,"BB":0.0841,"K":0.2197,"OUT":0.4529,"GIDP":0.0514,"HBP":0.0199,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.058,"sample":31,"avg":0.215,"obp":0.29,"slg":0.322,"k_pct":0.208,"bb_pct":0.075,"hard_hit":0.345,"outcomes":{"1B":0.139,"2B":0.055,"3B":0.0111,"HR":0.0099,"BB":0.0748,"K":0.2082,"OUT":0.4342,"GIDP":0.0389,"HBP":0.0255,"SF":0.0035},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.176,"obp":0.249,"slg":0.249,"k_pct":0.249,"bb_pct":0.073,"hard_hit":0.389,"outcomes":{"1B":0.1244,"2B":0.041,"3B":0.001,"HR":0.0098,"BB":0.0728,"K":0.2494,"OUT":0.4456,"GIDP":0.024,"HBP":0.0091,"SF":0.0228},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":522,"avg":0.225,"obp":0.293,"slg":0.337,"k_pct":0.198,"bb_pct":0.081,"hard_hit":0.361}},"676801":{"pitch_mix":{"FF":0.3505,"CH":0.1954,"SL":0.1562,"FC":0.1553,"CU":0.0805,"SI":0.0621},"vs_pitch":{"FF":{"pct":0.3505,"sample":211,"avg":0.241,"obp":0.344,"slg":0.341,"k_pct":0.164,"bb_pct":0.103,"hard_hit":0.294,"outcomes":{"1B":0.1783,"2B":0.0435,"3B":0.001,"HR":0.0181,"BB":0.1032,"K":0.1635,"OUT":0.441,"GIDP":0.0372,"HBP":0.001,"SF":0.0131},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0621,"sample":41,"avg":0.235,"obp":0.306,"slg":0.329,"k_pct":0.139,"bb_pct":0.071,"hard_hit":0.434,"outcomes":{"1B":0.1617,"2B":0.0617,"3B":0.001,"HR":0.0102,"BB":0.0714,"K":0.1388,"OUT":0.498,"GIDP":0.0441,"HBP":0.0121,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1954,"sample":147,"avg":0.232,"obp":0.309,"slg":0.326,"k_pct":0.187,"bb_pct":0.077,"hard_hit":0.388,"outcomes":{"1B":0.1595,"2B":0.0612,"3B":0.001,"HR":0.0102,"BB":0.0767,"K":0.1866,"OUT":0.4551,"GIDP":0.0297,"HBP":0.0148,"SF":0.0051},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1562,"sample":107,"avg":0.2,"obp":0.253,"slg":0.313,"k_pct":0.204,"bb_pct":0.054,"hard_hit":0.384,"outcomes":{"1B":0.141,"2B":0.027,"3B":0.0086,"HR":0.023,"BB":0.0536,"K":0.204,"OUT":0.4756,"GIDP":0.0405,"HBP":0.0258,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0805,"sample":56,"avg":0.185,"obp":0.261,"slg":0.341,"k_pct":0.212,"bb_pct":0.077,"hard_hit":0.408,"outcomes":{"1B":0.0941,"2B":0.047,"3B":0.022,"HR":0.0216,"BB":0.0766,"K":0.2121,"OUT":0.4807,"GIDP":0.0234,"HBP":0.0214,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1553,"sample":116,"avg":0.208,"obp":0.298,"slg":0.333,"k_pct":0.18,"bb_pct":0.09,"hard_hit":0.434,"outcomes":{"1B":0.1302,"2B":0.0529,"3B":0.0021,"HR":0.0226,"BB":0.0905,"K":0.1796,"OUT":0.4491,"GIDP":0.0598,"HBP":0.0122,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":13,"avg":0.146,"obp":0.224,"slg":0.191,"k_pct":0.254,"bb_pct":0.078,"hard_hit":0.287,"outcomes":{"1B":0.1214,"2B":0.013,"3B":0.0011,"HR":0.0101,"BB":0.0783,"K":0.2539,"OUT":0.4815,"GIDP":0.0383,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":445,"avg":0.248,"obp":0.318,"slg":0.369,"k_pct":0.179,"bb_pct":0.084,"hard_hit":0.508}},"671277":{"pitch_mix":{"FF":0.3147,"CH":0.2309,"SL":0.1789,"FC":0.1151,"CU":0.0886,"SI":0.0718},"vs_pitch":{"FF":{"pct":0.3147,"sample":171,"avg":0.26,"obp":0.328,"slg":0.406,"k_pct":0.171,"bb_pct":0.068,"hard_hit":0.375,"outcomes":{"1B":0.1655,"2B":0.0623,"3B":0.0127,"HR":0.0195,"BB":0.0675,"K":0.1706,"OUT":0.449,"GIDP":0.0237,"HBP":0.0245,"SF":0.0046},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0718,"sample":49,"avg":0.241,"obp":0.292,"slg":0.367,"k_pct":0.125,"bb_pct":0.051,"hard_hit":0.424,"outcomes":{"1B":0.166,"2B":0.0419,"3B":0.0155,"HR":0.0176,"BB":0.0507,"K":0.1252,"OUT":0.4913,"GIDP":0.0769,"HBP":0.0139,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2309,"sample":139,"avg":0.213,"obp":0.297,"slg":0.351,"k_pct":0.175,"bb_pct":0.084,"hard_hit":0.318,"outcomes":{"1B":0.1433,"2B":0.0228,"3B":0.0268,"HR":0.0204,"BB":0.0838,"K":0.1747,"OUT":0.4558,"GIDP":0.0547,"HBP":0.0166,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1789,"sample":122,"avg":0.196,"obp":0.256,"slg":0.325,"k_pct":0.218,"bb_pct":0.06,"hard_hit":0.353,"outcomes":{"1B":0.1331,"2B":0.0222,"3B":0.0154,"HR":0.0254,"BB":0.0597,"K":0.2179,"OUT":0.4922,"GIDP":0.0255,"HBP":0.0077,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0886,"sample":23,"avg":0.192,"obp":0.268,"slg":0.315,"k_pct":0.21,"bb_pct":0.076,"hard_hit":0.418,"outcomes":{"1B":0.1135,"2B":0.0438,"3B":0.0242,"HR":0.0103,"BB":0.0762,"K":0.21,"OUT":0.4413,"GIDP":0.0554,"HBP":0.0131,"SF":0.0122},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1151,"sample":44,"avg":0.197,"obp":0.267,"slg":0.287,"k_pct":0.167,"bb_pct":0.07,"hard_hit":0.379,"outcomes":{"1B":0.128,"2B":0.0579,"3B":0.001,"HR":0.0101,"BB":0.0696,"K":0.1669,"OUT":0.4856,"GIDP":0.0433,"HBP":0.0215,"SF":0.0161},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":17,"avg":0.197,"obp":0.276,"slg":0.325,"k_pct":0.213,"bb_pct":0.079,"hard_hit":0.369,"outcomes":{"1B":0.1199,"2B":0.0498,"3B":0.0048,"HR":0.0228,"BB":0.0785,"K":0.2127,"OUT":0.4688,"GIDP":0.0406,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":437,"avg":0.246,"obp":0.31,"slg":0.39,"k_pct":0.18,"bb_pct":0.07,"hard_hit":0.462}},"682641":{"pitch_mix":{"FF":0.5345,"SI":0.0504,"SL":0.1842,"CH":0.1018,"CU":0.0709,"FC":0.0582},"vs_pitch":{"FF":{"pct":0.5345,"sample":313,"avg":0.258,"obp":0.343,"slg":0.417,"k_pct":0.193,"bb_pct":0.085,"hard_hit":0.335,"outcomes":{"1B":0.1593,"2B":0.061,"3B":0.0142,"HR":0.0233,"BB":0.0851,"K":0.1925,"OUT":0.4194,"GIDP":0.0378,"HBP":0.0065,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0504,"sample":51,"avg":0.205,"obp":0.268,"slg":0.301,"k_pct":0.182,"bb_pct":0.063,"hard_hit":0.436,"outcomes":{"1B":0.1407,"2B":0.0482,"3B":0.001,"HR":0.0152,"BB":0.0634,"K":0.1823,"OUT":0.4456,"GIDP":0.0613,"HBP":0.0208,"SF":0.0216},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1018,"sample":40,"avg":0.218,"obp":0.294,"slg":0.317,"k_pct":0.216,"bb_pct":0.077,"hard_hit":0.359,"outcomes":{"1B":0.1584,"2B":0.0279,"3B":0.0216,"HR":0.0096,"BB":0.0766,"K":0.2165,"OUT":0.4641,"GIDP":0.0233,"HBP":0.0011,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1842,"sample":98,"avg":0.188,"obp":0.273,"slg":0.276,"k_pct":0.261,"bb_pct":0.085,"hard_hit":0.31,"outcomes":{"1B":0.1297,"2B":0.0392,"3B":0.0097,"HR":0.0096,"BB":0.0853,"K":0.2608,"OUT":0.4182,"GIDP":0.0325,"HBP":0.0056,"SF":0.0094},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0709,"sample":45,"avg":0.164,"obp":0.244,"slg":0.278,"k_pct":0.253,"bb_pct":0.08,"hard_hit":0.415,"outcomes":{"1B":0.0868,"2B":0.0498,"3B":0.0176,"HR":0.0097,"BB":0.0799,"K":0.2527,"OUT":0.4369,"GIDP":0.0493,"HBP":0.0072,"SF":0.0102},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0582,"sample":26,"avg":0.194,"obp":0.251,"slg":0.294,"k_pct":0.219,"bb_pct":0.057,"hard_hit":0.326,"outcomes":{"1B":0.1388,"2B":0.0322,"3B":0.001,"HR":0.0219,"BB":0.057,"K":0.2191,"OUT":0.4503,"GIDP":0.0589,"HBP":0.0198,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.174,"obp":0.238,"slg":0.239,"k_pct":0.254,"bb_pct":0.064,"hard_hit":0.287,"outcomes":{"1B":0.1307,"2B":0.033,"3B":0.001,"HR":0.0097,"BB":0.0638,"K":0.2544,"OUT":0.4345,"GIDP":0.0533,"HBP":0.0188,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":501,"avg":0.251,"obp":0.316,"slg":0.394,"k_pct":0.213,"bb_pct":0.081,"hard_hit":0.465}},"694973":{"pitch_mix":{"FF":0.5006,"SI":0.0676,"SL":0.1714,"CH":0.1133,"CU":0.0712,"FC":0.076},"vs_pitch":{"FF":{"pct":0.5006,"sample":279,"avg":0.227,"obp":0.289,"slg":0.37,"k_pct":0.184,"bb_pct":0.062,"hard_hit":0.281,"outcomes":{"1B":0.1401,"2B":0.0461,"3B":0.025,"HR":0.0156,"BB":0.0623,"K":0.1842,"OUT":0.4299,"GIDP":0.0487,"HBP":0.0268,"SF":0.0213},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0676,"sample":46,"avg":0.227,"obp":0.281,"slg":0.336,"k_pct":0.171,"bb_pct":0.055,"hard_hit":0.397,"outcomes":{"1B":0.147,"2B":0.064,"3B":0.001,"HR":0.0146,"BB":0.0547,"K":0.171,"OUT":0.4614,"GIDP":0.0735,"HBP":0.012,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1133,"sample":59,"avg":0.212,"obp":0.276,"slg":0.28,"k_pct":0.243,"bb_pct":0.064,"hard_hit":0.295,"outcomes":{"1B":0.1655,"2B":0.035,"3B":0.0011,"HR":0.0103,"BB":0.0644,"K":0.2434,"OUT":0.444,"GIDP":0.0219,"HBP":0.0133,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1714,"sample":77,"avg":0.166,"obp":0.254,"slg":0.257,"k_pct":0.258,"bb_pct":0.087,"hard_hit":0.436,"outcomes":{"1B":0.1029,"2B":0.0456,"3B":0.0083,"HR":0.0096,"BB":0.0873,"K":0.2581,"OUT":0.4301,"GIDP":0.0415,"HBP":0.0058,"SF":0.0108},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0712,"sample":12,"avg":0.164,"obp":0.236,"slg":0.251,"k_pct":0.264,"bb_pct":0.072,"hard_hit":0.326,"outcomes":{"1B":0.106,"2B":0.0395,"3B":0.0091,"HR":0.0097,"BB":0.0721,"K":0.2643,"OUT":0.4448,"GIDP":0.0485,"HBP":0.005,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.076,"sample":72,"avg":0.208,"obp":0.282,"slg":0.33,"k_pct":0.214,"bb_pct":0.074,"hard_hit":0.348,"outcomes":{"1B":0.1249,"2B":0.0552,"3B":0.0186,"HR":0.0096,"BB":0.0739,"K":0.2141,"OUT":0.4388,"GIDP":0.0487,"HBP":0.001,"SF":0.0152},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":24,"avg":0.159,"obp":0.223,"slg":0.216,"k_pct":0.263,"bb_pct":0.064,"hard_hit":0.34,"outcomes":{"1B":0.1273,"2B":0.0147,"3B":0.0071,"HR":0.0095,"BB":0.0642,"K":0.2629,"OUT":0.4365,"GIDP":0.0559,"HBP":0.001,"SF":0.0211},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":421,"avg":0.232,"obp":0.294,"slg":0.362,"k_pct":0.211,"bb_pct":0.068,"hard_hit":0.432}},"683614":{"pitch_mix":{"FF":0.5324,"SI":0.0704,"SL":0.1968,"CH":0.1124,"CU":0.0774,"FC":0.0105},"vs_pitch":{"FF":{"pct":0.5324,"sample":289,"avg":0.212,"obp":0.305,"slg":0.304,"k_pct":0.221,"bb_pct":0.093,"hard_hit":0.305,"outcomes":{"1B":0.1482,"2B":0.0453,"3B":0.0091,"HR":0.0096,"BB":0.093,"K":0.2209,"OUT":0.4221,"GIDP":0.0424,"HBP":0.0085,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0704,"sample":60,"avg":0.214,"obp":0.279,"slg":0.319,"k_pct":0.176,"bb_pct":0.065,"hard_hit":0.324,"outcomes":{"1B":0.1387,"2B":0.0542,"3B":0.0112,"HR":0.0096,"BB":0.065,"K":0.1757,"OUT":0.4552,"GIDP":0.0743,"HBP":0.0154,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1124,"sample":69,"avg":0.203,"obp":0.282,"slg":0.293,"k_pct":0.236,"bb_pct":0.079,"hard_hit":0.397,"outcomes":{"1B":0.1534,"2B":0.0217,"3B":0.0152,"HR":0.0126,"BB":0.0794,"K":0.2358,"OUT":0.428,"GIDP":0.0376,"HBP":0.0151,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1968,"sample":110,"avg":0.155,"obp":0.225,"slg":0.232,"k_pct":0.282,"bb_pct":0.071,"hard_hit":0.288,"outcomes":{"1B":0.1054,"2B":0.0314,"3B":0.0085,"HR":0.0095,"BB":0.0706,"K":0.2817,"OUT":0.458,"GIDP":0.0228,"HBP":0.0025,"SF":0.0097},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0774,"sample":70,"avg":0.158,"obp":0.253,"slg":0.234,"k_pct":0.267,"bb_pct":0.095,"hard_hit":0.39,"outcomes":{"1B":0.1019,"2B":0.0453,"3B":0.001,"HR":0.0096,"BB":0.0947,"K":0.2671,"OUT":0.4519,"GIDP":0.0265,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0105,"sample":10,"avg":0.204,"obp":0.277,"slg":0.305,"k_pct":0.241,"bb_pct":0.074,"hard_hit":0.427,"outcomes":{"1B":0.1338,"2B":0.0477,"3B":0.0126,"HR":0.0096,"BB":0.0736,"K":0.2414,"OUT":0.433,"GIDP":0.0409,"HBP":0.0039,"SF":0.0034},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":20,"avg":0.136,"obp":0.222,"slg":0.212,"k_pct":0.265,"bb_pct":0.086,"hard_hit":0.401,"outcomes":{"1B":0.0984,"2B":0.0175,"3B":0.0039,"HR":0.0166,"BB":0.0855,"K":0.2654,"OUT":0.4264,"GIDP":0.0542,"HBP":0.0204,"SF":0.0117},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":449,"avg":0.216,"obp":0.289,"slg":0.314,"k_pct":0.235,"bb_pct":0.085,"hard_hit":0.433}},"691177":{"pitch_mix":{"FF":0.5901,"SI":0.0526,"SL":0.1818,"CH":0.0655,"CU":0.051,"FC":0.059},"vs_pitch":{"FF":{"pct":0.5901,"sample":368,"avg":0.235,"obp":0.334,"slg":0.384,"k_pct":0.195,"bb_pct":0.098,"hard_hit":0.303,"outcomes":{"1B":0.1453,"2B":0.0475,"3B":0.0264,"HR":0.0161,"BB":0.0983,"K":0.1946,"OUT":0.4203,"GIDP":0.0495,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0526,"sample":10,"avg":0.184,"obp":0.251,"slg":0.249,"k_pct":0.198,"bb_pct":0.067,"hard_hit":0.285,"outcomes":{"1B":0.1388,"2B":0.0347,"3B":0.001,"HR":0.0095,"BB":0.0671,"K":0.1976,"OUT":0.4597,"GIDP":0.0705,"HBP":0.0201,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.0655,"sample":46,"avg":0.234,"obp":0.298,"slg":0.374,"k_pct":0.228,"bb_pct":0.065,"hard_hit":0.424,"outcomes":{"1B":0.1546,"2B":0.0457,"3B":0.005,"HR":0.0283,"BB":0.0646,"K":0.2278,"OUT":0.4397,"GIDP":0.025,"HBP":0.0011,"SF":0.0084},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1818,"sample":94,"avg":0.157,"obp":0.242,"slg":0.247,"k_pct":0.28,"bb_pct":0.085,"hard_hit":0.361,"outcomes":{"1B":0.1045,"2B":0.0331,"3B":0.001,"HR":0.0183,"BB":0.0852,"K":0.2799,"OUT":0.4317,"GIDP":0.0257,"HBP":0.0078,"SF":0.0128},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.051,"sample":59,"avg":0.163,"obp":0.256,"slg":0.271,"k_pct":0.266,"bb_pct":0.094,"hard_hit":0.314,"outcomes":{"1B":0.088,"2B":0.0502,"3B":0.0147,"HR":0.0097,"BB":0.0939,"K":0.2663,"OUT":0.416,"GIDP":0.0478,"HBP":0.001,"SF":0.0124},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.059,"sample":19,"avg":0.205,"obp":0.273,"slg":0.298,"k_pct":0.248,"bb_pct":0.068,"hard_hit":0.345,"outcomes":{"1B":0.1417,"2B":0.0486,"3B":0.001,"HR":0.014,"BB":0.068,"K":0.2476,"OUT":0.4397,"GIDP":0.0344,"HBP":0.0042,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.163,"obp":0.242,"slg":0.22,"k_pct":0.27,"bb_pct":0.079,"hard_hit":0.325,"outcomes":{"1B":0.129,"2B":0.0222,"3B":0.0026,"HR":0.0097,"BB":0.0787,"K":0.2695,"OUT":0.4354,"GIDP":0.0482,"HBP":0.001,"SF":0.0037},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":573,"avg":0.236,"obp":0.306,"slg":0.377,"k_pct":0.219,"bb_pct":0.09,"hard_hit":0.497}},"623352":{"pitch_mix":{"FF":0.3967,"SL":0.2651,"CH":0.1224,"CU":0.1076,"FC":0.0849,"SI":0.0232},"vs_pitch":{"FF":{"pct":0.3967,"sample":251,"avg":0.285,"obp":0.358,"slg":0.481,"k_pct":0.158,"bb_pct":0.073,"hard_hit":0.294,"outcomes":{"1B":0.17,"2B":0.0643,"3B":0.0187,"HR":0.0316,"BB":0.0731,"K":0.1576,"OUT":0.4273,"GIDP":0.0459,"HBP":0.0057,"SF":0.0058},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0232,"sample":10,"avg":0.199,"obp":0.275,"slg":0.293,"k_pct":0.177,"bb_pct":0.076,"hard_hit":0.3,"outcomes":{"1B":0.1344,"2B":0.0455,"3B":0.0095,"HR":0.0098,"BB":0.0761,"K":0.1769,"OUT":0.4574,"GIDP":0.0781,"HBP":0.0035,"SF":0.0087},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1224,"sample":81,"avg":0.222,"obp":0.305,"slg":0.328,"k_pct":0.191,"bb_pct":0.083,"hard_hit":0.432,"outcomes":{"1B":0.1534,"2B":0.049,"3B":0.001,"HR":0.0185,"BB":0.0832,"K":0.1908,"OUT":0.4513,"GIDP":0.0457,"HBP":0.004,"SF":0.003},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2651,"sample":182,"avg":0.192,"obp":0.247,"slg":0.264,"k_pct":0.24,"bb_pct":0.055,"hard_hit":0.291,"outcomes":{"1B":0.1402,"2B":0.0406,"3B":0.001,"HR":0.0099,"BB":0.055,"K":0.2401,"OUT":0.4407,"GIDP":0.0579,"HBP":0.001,"SF":0.0135},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1076,"sample":84,"avg":0.194,"obp":0.27,"slg":0.301,"k_pct":0.236,"bb_pct":0.077,"hard_hit":0.355,"outcomes":{"1B":0.1181,"2B":0.0593,"3B":0.001,"HR":0.0153,"BB":0.0767,"K":0.2364,"OUT":0.437,"GIDP":0.0232,"HBP":0.0182,"SF":0.0148},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0849,"sample":27,"avg":0.188,"obp":0.27,"slg":0.274,"k_pct":0.201,"bb_pct":0.082,"hard_hit":0.341,"outcomes":{"1B":0.1315,"2B":0.0399,"3B":0.0052,"HR":0.0117,"BB":0.0822,"K":0.2013,"OUT":0.43,"GIDP":0.0505,"HBP":0.0286,"SF":0.0192},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":21,"avg":0.151,"obp":0.234,"slg":0.21,"k_pct":0.265,"bb_pct":0.083,"hard_hit":0.342,"outcomes":{"1B":0.1136,"2B":0.0252,"3B":0.0024,"HR":0.0098,"BB":0.0826,"K":0.265,"OUT":0.4443,"GIDP":0.0485,"HBP":0.0077,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":448,"avg":0.255,"obp":0.311,"slg":0.399,"k_pct":0.196,"bb_pct":0.071,"hard_hit":0.464}},"592662":{"pitch_mix":{"FF":0.3455,"CH":0.2081,"SL":0.1866,"FC":0.1401,"CU":0.1069,"SI":0.0127},"vs_pitch":{"FF":{"pct":0.3455,"sample":200,"avg":0.225,"obp":0.321,"slg":0.328,"k_pct":0.176,"bb_pct":0.096,"hard_hit":0.336,"outcomes":{"1B":0.1573,"2B":0.0444,"3B":0.0117,"HR":0.0118,"BB":0.0955,"K":0.1763,"OUT":0.4623,"GIDP":0.0246,"HBP":0.0149,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0127,"sample":18,"avg":0.238,"obp":0.285,"slg":0.348,"k_pct":0.132,"bb_pct":0.047,"hard_hit":0.33,"outcomes":{"1B":0.1714,"2B":0.0332,"3B":0.0231,"HR":0.0102,"BB":0.0468,"K":0.1322,"OUT":0.5066,"GIDP":0.0577,"HBP":0.0176,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2081,"sample":120,"avg":0.22,"obp":0.293,"slg":0.348,"k_pct":0.187,"bb_pct":0.073,"hard_hit":0.323,"outcomes":{"1B":0.1359,"2B":0.0518,"3B":0.0226,"HR":0.0102,"BB":0.0728,"K":0.1869,"OUT":0.4591,"GIDP":0.0504,"HBP":0.0054,"SF":0.005},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1866,"sample":113,"avg":0.208,"obp":0.275,"slg":0.333,"k_pct":0.216,"bb_pct":0.067,"hard_hit":0.41,"outcomes":{"1B":0.1294,"2B":0.0441,"3B":0.0248,"HR":0.0102,"BB":0.0665,"K":0.2158,"OUT":0.4686,"GIDP":0.0243,"HBP":0.0152,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1069,"sample":50,"avg":0.176,"obp":0.257,"slg":0.289,"k_pct":0.212,"bb_pct":0.081,"hard_hit":0.288,"outcomes":{"1B":0.1203,"2B":0.0275,"3B":0.001,"HR":0.0276,"BB":0.0805,"K":0.2119,"OUT":0.4837,"GIDP":0.0237,"HBP":0.0227,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1401,"sample":84,"avg":0.232,"obp":0.289,"slg":0.336,"k_pct":0.196,"bb_pct":0.057,"hard_hit":0.348,"outcomes":{"1B":0.1708,"2B":0.0385,"3B":0.001,"HR":0.0213,"BB":0.0571,"K":0.1957,"OUT":0.4618,"GIDP":0.0357,"HBP":0.001,"SF":0.0171},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":18,"avg":0.165,"obp":0.241,"slg":0.246,"k_pct":0.242,"bb_pct":0.077,"hard_hit":0.402,"outcomes":{"1B":0.1223,"2B":0.014,"3B":0.0181,"HR":0.0103,"BB":0.0768,"K":0.2417,"OUT":0.472,"GIDP":0.039,"HBP":0.001,"SF":0.0049},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":466,"avg":0.239,"obp":0.307,"slg":0.365,"k_pct":0.192,"bb_pct":0.078,"hard_hit":0.526}},"657277":{"pitch_mix":{"FF":0.4002,"SL":0.2451,"CH":0.1219,"CU":0.117,"FC":0.0613,"SI":0.0545},"vs_pitch":{"FF":{"pct":0.4002,"sample":239,"avg":0.245,"obp":0.335,"slg":0.385,"k_pct":0.189,"bb_pct":0.09,"hard_hit":0.304,"outcomes":{"1B":0.1687,"2B":0.0389,"3B":0.012,"HR":0.0257,"BB":0.0899,"K":0.1888,"OUT":0.4272,"GIDP":0.0469,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0545,"sample":43,"avg":0.212,"obp":0.267,"slg":0.304,"k_pct":0.178,"bb_pct":0.055,"hard_hit":0.306,"outcomes":{"1B":0.1418,"2B":0.0595,"3B":0.001,"HR":0.01,"BB":0.0547,"K":0.1783,"OUT":0.4795,"GIDP":0.0499,"HBP":0.0068,"SF":0.0186},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1219,"sample":100,"avg":0.196,"obp":0.26,"slg":0.259,"k_pct":0.219,"bb_pct":0.064,"hard_hit":0.286,"outcomes":{"1B":0.1547,"2B":0.0307,"3B":0.0011,"HR":0.0099,"BB":0.0636,"K":0.219,"OUT":0.4502,"GIDP":0.041,"HBP":0.0288,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2451,"sample":172,"avg":0.153,"obp":0.231,"slg":0.234,"k_pct":0.23,"bb_pct":0.078,"hard_hit":0.423,"outcomes":{"1B":0.1084,"2B":0.0259,"3B":0.001,"HR":0.0176,"BB":0.0776,"K":0.2302,"OUT":0.4713,"GIDP":0.0595,"HBP":0.0076,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.117,"sample":55,"avg":0.153,"obp":0.255,"slg":0.26,"k_pct":0.228,"bb_pct":0.101,"hard_hit":0.298,"outcomes":{"1B":0.0973,"2B":0.0305,"3B":0.001,"HR":0.0246,"BB":0.1013,"K":0.228,"OUT":0.4454,"GIDP":0.0343,"HBP":0.0207,"SF":0.0169},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0613,"sample":57,"avg":0.226,"obp":0.311,"slg":0.358,"k_pct":0.21,"bb_pct":0.085,"hard_hit":0.33,"outcomes":{"1B":0.1431,"2B":0.0552,"3B":0.0057,"HR":0.0219,"BB":0.0847,"K":0.2103,"OUT":0.4238,"GIDP":0.0533,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":31,"avg":0.203,"obp":0.3,"slg":0.318,"k_pct":0.238,"bb_pct":0.097,"hard_hit":0.374,"outcomes":{"1B":0.1326,"2B":0.0393,"3B":0.0162,"HR":0.0146,"BB":0.097,"K":0.2377,"OUT":0.4322,"GIDP":0.0284,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":545,"avg":0.224,"obp":0.294,"slg":0.345,"k_pct":0.208,"bb_pct":0.083,"hard_hit":0.457}},"663554":{"pitch_mix":{"SI":0.414,"FF":0.1977,"CH":0.192,"SL":0.1234,"CU":0.0624,"FC":0.0105},"vs_pitch":{"FF":{"pct":0.1977,"sample":91,"avg":0.223,"obp":0.295,"slg":0.3,"k_pct":0.155,"bb_pct":0.072,"hard_hit":0.391,"outcomes":{"1B":0.1714,"2B":0.0357,"3B":0.006,"HR":0.0098,"BB":0.0722,"K":0.1555,"OUT":0.4916,"GIDP":0.0213,"HBP":0.0196,"SF":0.0169},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.414,"sample":242,"avg":0.214,"obp":0.291,"slg":0.299,"k_pct":0.122,"bb_pct":0.077,"hard_hit":0.281,"outcomes":{"1B":0.1575,"2B":0.0387,"3B":0.0079,"HR":0.01,"BB":0.0766,"K":0.1217,"OUT":0.5006,"GIDP":0.0439,"HBP":0.0241,"SF":0.0189},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.192,"sample":105,"avg":0.232,"obp":0.324,"slg":0.358,"k_pct":0.169,"bb_pct":0.091,"hard_hit":0.421,"outcomes":{"1B":0.1479,"2B":0.0536,"3B":0.0213,"HR":0.0097,"BB":0.0914,"K":0.1691,"OUT":0.4537,"GIDP":0.0509,"HBP":0.001,"SF":0.0015},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1234,"sample":100,"avg":0.174,"obp":0.252,"slg":0.264,"k_pct":0.213,"bb_pct":0.077,"hard_hit":0.427,"outcomes":{"1B":0.1214,"2B":0.0339,"3B":0.001,"HR":0.0179,"BB":0.0775,"K":0.2129,"OUT":0.469,"GIDP":0.0342,"HBP":0.0203,"SF":0.0119},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0624,"sample":48,"avg":0.136,"obp":0.226,"slg":0.195,"k_pct":0.216,"bb_pct":0.09,"hard_hit":0.383,"outcomes":{"1B":0.0981,"2B":0.0273,"3B":0.001,"HR":0.0099,"BB":0.0897,"K":0.216,"OUT":0.4925,"GIDP":0.0342,"HBP":0.0164,"SF":0.015},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0105,"sample":29,"avg":0.211,"obp":0.287,"slg":0.295,"k_pct":0.165,"bb_pct":0.076,"hard_hit":0.384,"outcomes":{"1B":0.148,"2B":0.0524,"3B":0.001,"HR":0.0098,"BB":0.0762,"K":0.1649,"OUT":0.4883,"GIDP":0.0267,"HBP":0.0098,"SF":0.0231},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.163,"obp":0.241,"slg":0.267,"k_pct":0.235,"bb_pct":0.078,"hard_hit":0.312,"outcomes":{"1B":0.1056,"2B":0.0337,"3B":0.001,"HR":0.0227,"BB":0.078,"K":0.2349,"OUT":0.4843,"GIDP":0.027,"HBP":0.0118,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":526,"avg":0.236,"obp":0.307,"slg":0.337,"k_pct":0.155,"bb_pct":0.08,"hard_hit":0.424}},"656371":{"pitch_mix":{"FF":0.3505,"CH":0.2011,"SL":0.2186,"FC":0.154,"CU":0.0652,"SI":0.0106},"vs_pitch":{"FF":{"pct":0.3505,"sample":189,"avg":0.243,"obp":0.327,"slg":0.334,"k_pct":0.15,"bb_pct":0.084,"hard_hit":0.294,"outcomes":{"1B":0.1742,"2B":0.0581,"3B":0.001,"HR":0.0102,"BB":0.0838,"K":0.15,"OUT":0.474,"GIDP":0.0234,"HBP":0.0157,"SF":0.0096},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0106,"sample":10,"avg":0.231,"obp":0.289,"slg":0.351,"k_pct":0.148,"bb_pct":0.058,"hard_hit":0.431,"outcomes":{"1B":0.1451,"2B":0.0683,"3B":0.001,"HR":0.0166,"BB":0.0578,"K":0.1477,"OUT":0.4813,"GIDP":0.0674,"HBP":0.001,"SF":0.0136},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2011,"sample":101,"avg":0.222,"obp":0.303,"slg":0.319,"k_pct":0.168,"bb_pct":0.082,"hard_hit":0.345,"outcomes":{"1B":0.1622,"2B":0.0324,"3B":0.0168,"HR":0.0103,"BB":0.0818,"K":0.1675,"OUT":0.4538,"GIDP":0.056,"HBP":0.0181,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2186,"sample":121,"avg":0.159,"obp":0.251,"slg":0.227,"k_pct":0.218,"bb_pct":0.092,"hard_hit":0.436,"outcomes":{"1B":0.1135,"2B":0.0337,"3B":0.001,"HR":0.0107,"BB":0.092,"K":0.2184,"OUT":0.4877,"GIDP":0.0408,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0652,"sample":31,"avg":0.158,"obp":0.259,"slg":0.222,"k_pct":0.198,"bb_pct":0.102,"hard_hit":0.439,"outcomes":{"1B":0.1156,"2B":0.0308,"3B":0.0011,"HR":0.0103,"BB":0.1015,"K":0.1977,"OUT":0.4888,"GIDP":0.0239,"HBP":0.0273,"SF":0.0031},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.154,"sample":119,"avg":0.258,"obp":0.313,"slg":0.402,"k_pct":0.169,"bb_pct":0.054,"hard_hit":0.37,"outcomes":{"1B":0.1662,"2B":0.0618,"3B":0.0094,"HR":0.0211,"BB":0.0545,"K":0.1686,"OUT":0.4786,"GIDP":0.0338,"HBP":0.0051,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.178,"obp":0.277,"slg":0.278,"k_pct":0.215,"bb_pct":0.099,"hard_hit":0.437,"outcomes":{"1B":0.1291,"2B":0.0213,"3B":0.0043,"HR":0.0234,"BB":0.0994,"K":0.2146,"OUT":0.4627,"GIDP":0.0431,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":547,"avg":0.241,"obp":0.311,"slg":0.345,"k_pct":0.174,"bb_pct":0.082,"hard_hit":0.524}},"678626":{"pitch_mix":{"FF":0.4959,"SI":0.0905,"SL":0.2123,"CH":0.0749,"CU":0.0818,"FC":0.0445},"vs_pitch":{"FF":{"pct":0.4959,"sample":318,"avg":0.231,"obp":0.3,"slg":0.359,"k_pct":0.22,"bb_pct":0.069,"hard_hit":0.35,"outcomes":{"1B":0.1624,"2B":0.0387,"3B":0.001,"HR":0.0291,"BB":0.0693,"K":0.2203,"OUT":0.4205,"GIDP":0.0249,"HBP":0.023,"SF":0.0108},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0905,"sample":69,"avg":0.188,"obp":0.236,"slg":0.253,"k_pct":0.191,"bb_pct":0.048,"hard_hit":0.37,"outcomes":{"1B":0.1438,"2B":0.0333,"3B":0.0011,"HR":0.0097,"BB":0.0482,"K":0.1914,"OUT":0.4812,"GIDP":0.0785,"HBP":0.0102,"SF":0.0027},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.0749,"sample":50,"avg":0.189,"obp":0.263,"slg":0.272,"k_pct":0.216,"bb_pct":0.074,"hard_hit":0.423,"outcomes":{"1B":0.1396,"2B":0.0245,"3B":0.0149,"HR":0.0096,"BB":0.0742,"K":0.2161,"OUT":0.4326,"GIDP":0.0536,"HBP":0.018,"SF":0.017},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2123,"sample":98,"avg":0.189,"obp":0.258,"slg":0.304,"k_pct":0.253,"bb_pct":0.069,"hard_hit":0.325,"outcomes":{"1B":0.116,"2B":0.0409,"3B":0.0225,"HR":0.0097,"BB":0.0687,"K":0.253,"OUT":0.4087,"GIDP":0.0479,"HBP":0.0142,"SF":0.0184},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0818,"sample":59,"avg":0.182,"obp":0.257,"slg":0.286,"k_pct":0.252,"bb_pct":0.075,"hard_hit":0.433,"outcomes":{"1B":0.1305,"2B":0.025,"3B":0.001,"HR":0.0256,"BB":0.0746,"K":0.2521,"OUT":0.4331,"GIDP":0.0385,"HBP":0.0164,"SF":0.0032},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0445,"sample":10,"avg":0.192,"obp":0.275,"slg":0.301,"k_pct":0.212,"bb_pct":0.083,"hard_hit":0.418,"outcomes":{"1B":0.1352,"2B":0.0191,"3B":0.0224,"HR":0.015,"BB":0.0832,"K":0.2122,"OUT":0.4339,"GIDP":0.0466,"HBP":0.0258,"SF":0.0064},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.179,"obp":0.258,"slg":0.273,"k_pct":0.276,"bb_pct":0.08,"hard_hit":0.294,"outcomes":{"1B":0.1283,"2B":0.0207,"3B":0.0154,"HR":0.0144,"BB":0.0795,"K":0.2759,"OUT":0.4212,"GIDP":0.0293,"HBP":0.001,"SF":0.0144},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":473,"avg":0.232,"obp":0.297,"slg":0.358,"k_pct":0.227,"bb_pct":0.069,"hard_hit":0.383}},"657081":{"pitch_mix":{"FF":0.36,"CH":0.1816,"SL":0.1989,"FC":0.1513,"CU":0.0692,"SI":0.039},"vs_pitch":{"FF":{"pct":0.36,"sample":216,"avg":0.248,"obp":0.315,"slg":0.382,"k_pct":0.16,"bb_pct":0.067,"hard_hit":0.323,"outcomes":{"1B":0.1606,"2B":0.0636,"3B":0.001,"HR":0.0228,"BB":0.0667,"K":0.1601,"OUT":0.4531,"GIDP":0.0414,"HBP":0.0098,"SF":0.0208},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.039,"sample":34,"avg":0.212,"obp":0.262,"slg":0.284,"k_pct":0.142,"bb_pct":0.05,"hard_hit":0.39,"outcomes":{"1B":0.163,"2B":0.0354,"3B":0.0031,"HR":0.0102,"BB":0.0501,"K":0.1425,"OUT":0.4888,"GIDP":0.0638,"HBP":0.0305,"SF":0.0127},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1816,"sample":135,"avg":0.205,"obp":0.282,"slg":0.309,"k_pct":0.181,"bb_pct":0.077,"hard_hit":0.328,"outcomes":{"1B":0.1372,"2B":0.043,"3B":0.0121,"HR":0.0124,"BB":0.0773,"K":0.1809,"OUT":0.4928,"GIDP":0.0423,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1989,"sample":141,"avg":0.17,"obp":0.26,"slg":0.255,"k_pct":0.217,"bb_pct":0.089,"hard_hit":0.321,"outcomes":{"1B":0.1136,"2B":0.0383,"3B":0.008,"HR":0.0103,"BB":0.0895,"K":0.2174,"OUT":0.4651,"GIDP":0.0377,"HBP":0.0068,"SF":0.0133},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0692,"sample":30,"avg":0.152,"obp":0.257,"slg":0.219,"k_pct":0.204,"bb_pct":0.105,"hard_hit":0.33,"outcomes":{"1B":0.1109,"2B":0.0254,"3B":0.0056,"HR":0.0101,"BB":0.1053,"K":0.2043,"OUT":0.4774,"GIDP":0.039,"HBP":0.0011,"SF":0.0209},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.1513,"sample":76,"avg":0.226,"obp":0.291,"slg":0.35,"k_pct":0.189,"bb_pct":0.064,"hard_hit":0.419,"outcomes":{"1B":0.1501,"2B":0.0508,"3B":0.003,"HR":0.0224,"BB":0.0643,"K":0.1887,"OUT":0.4674,"GIDP":0.0288,"HBP":0.001,"SF":0.0235},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.15,"obp":0.218,"slg":0.214,"k_pct":0.224,"bb_pct":0.068,"hard_hit":0.328,"outcomes":{"1B":0.1066,"2B":0.032,"3B":0.001,"HR":0.0101,"BB":0.0682,"K":0.2235,"OUT":0.4671,"GIDP":0.0559,"HBP":0.0272,"SF":0.0083},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":577,"avg":0.236,"obp":0.295,"slg":0.358,"k_pct":0.182,"bb_pct":0.075,"hard_hit":0.422}},"669373":{"pitch_mix":{"FF":0.314,"SI":0.1445,"CH":0.2261,"SL":0.1541,"CU":0.1175,"FC":0.0439},"vs_pitch":{"FF":{"pct":0.314,"sample":170,"avg":0.24,"obp":0.311,"slg":0.418,"k_pct":0.163,"bb_pct":0.071,"hard_hit":0.294,"outcomes":{"1B":0.1507,"2B":0.032,"3B":0.0269,"HR":0.0307,"BB":0.0712,"K":0.1625,"OUT":0.4541,"GIDP":0.039,"HBP":0.0157,"SF":0.0173},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.1445,"sample":71,"avg":0.217,"obp":0.296,"slg":0.29,"k_pct":0.144,"bb_pct":0.079,"hard_hit":0.312,"outcomes":{"1B":0.1668,"2B":0.0372,"3B":0.0029,"HR":0.0101,"BB":0.0787,"K":0.1444,"OUT":0.4944,"GIDP":0.0615,"HBP":0.001,"SF":0.003},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.2261,"sample":140,"avg":0.205,"obp":0.289,"slg":0.29,"k_pct":0.177,"bb_pct":0.084,"hard_hit":0.44,"outcomes":{"1B":0.1411,"2B":0.0529,"3B":0.001,"HR":0.0101,"BB":0.0844,"K":0.1769,"OUT":0.455,"GIDP":0.0535,"HBP":0.0173,"SF":0.0078},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.1541,"sample":98,"avg":0.163,"obp":0.253,"slg":0.255,"k_pct":0.234,"bb_pct":0.09,"hard_hit":0.331,"outcomes":{"1B":0.105,"2B":0.0372,"3B":0.0058,"HR":0.0145,"BB":0.0904,"K":0.234,"OUT":0.4807,"GIDP":0.0303,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.1175,"sample":52,"avg":0.167,"obp":0.26,"slg":0.259,"k_pct":0.226,"bb_pct":0.093,"hard_hit":0.355,"outcomes":{"1B":0.0965,"2B":0.058,"3B":0.0017,"HR":0.0103,"BB":0.0934,"K":0.2263,"OUT":0.4618,"GIDP":0.0499,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0439,"sample":20,"avg":0.201,"obp":0.287,"slg":0.309,"k_pct":0.183,"bb_pct":0.086,"hard_hit":0.434,"outcomes":{"1B":0.1356,"2B":0.04,"3B":0.0085,"HR":0.0169,"BB":0.0862,"K":0.1826,"OUT":0.4549,"GIDP":0.0384,"HBP":0.0241,"SF":0.0128},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":10,"avg":0.191,"obp":0.28,"slg":0.299,"k_pct":0.225,"bb_pct":0.088,"hard_hit":0.308,"outcomes":{"1B":0.127,"2B":0.0356,"3B":0.0129,"HR":0.0156,"BB":0.0885,"K":0.225,"OUT":0.4377,"GIDP":0.0301,"HBP":0.0173,"SF":0.0103},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":460,"avg":0.23,"obp":0.298,"slg":0.358,"k_pct":0.182,"bb_pct":0.082,"hard_hit":0.471}},"660271_p":{"pitch_mix":{"FF":0.5516,"SI":0.0464,"SL":0.2109,"CH":0.1089,"CU":0.0426,"FC":0.0395},"vs_pitch":{"FF":{"pct":0.5516,"sample":332,"avg":0.221,"obp":0.31,"slg":0.29,"k_pct":0.214,"bb_pct":0.089,"hard_hit":0.305,"outcomes":{"1B":0.1732,"2B":0.0376,"3B":0.001,"HR":0.0096,"BB":0.0888,"K":0.2142,"OUT":0.4338,"GIDP":0.0367,"HBP":0.001,"SF":0.0042},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SI":{"pct":0.0464,"sample":10,"avg":0.212,"obp":0.262,"slg":0.327,"k_pct":0.191,"bb_pct":0.05,"hard_hit":0.396,"outcomes":{"1B":0.1355,"2B":0.0466,"3B":0.0198,"HR":0.0096,"BB":0.0502,"K":0.1909,"OUT":0.4388,"GIDP":0.075,"HBP":0.0101,"SF":0.0234},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CH":{"pct":0.1089,"sample":68,"avg":0.202,"obp":0.298,"slg":0.292,"k_pct":0.233,"bb_pct":0.096,"hard_hit":0.403,"outcomes":{"1B":0.1375,"2B":0.048,"3B":0.0068,"HR":0.0095,"BB":0.0962,"K":0.2326,"OUT":0.4387,"GIDP":0.0232,"HBP":0.0066,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"SL":{"pct":0.2109,"sample":113,"avg":0.177,"obp":0.235,"slg":0.26,"k_pct":0.255,"bb_pct":0.058,"hard_hit":0.304,"outcomes":{"1B":0.1297,"2B":0.0208,"3B":0.0152,"HR":0.0108,"BB":0.0582,"K":0.2553,"OUT":0.4393,"GIDP":0.0411,"HBP":0.0188,"SF":0.0108},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"CU":{"pct":0.0426,"sample":10,"avg":0.149,"obp":0.231,"slg":0.22,"k_pct":0.261,"bb_pct":0.082,"hard_hit":0.307,"outcomes":{"1B":0.1071,"2B":0.0216,"3B":0.0104,"HR":0.0097,"BB":0.0819,"K":0.2613,"OUT":0.4632,"GIDP":0.0269,"HBP":0.0169,"SF":0.0011},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FC":{"pct":0.0395,"sample":38,"avg":0.212,"obp":0.265,"slg":0.312,"k_pct":0.25,"bb_pct":0.053,"hard_hit":0.375,"outcomes":{"1B":0.1385,"2B":0.0575,"3B":0.0069,"HR":0.0095,"BB":0.0529,"K":0.2496,"OUT":0.4464,"GIDP":0.0365,"HBP":0.001,"SF":0.001},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}},"FS":{"pct":0.01,"sample":24,"avg":0.172,"obp":0.238,"slg":0.263,"k_pct":0.271,"bb_pct":0.066,"hard_hit":0.402,"outcomes":{"1B":0.1119,"2B":0.0397,"3B":0.011,"HR":0.0097,"BB":0.0662,"K":0.2707,"OUT":0.4187,"GIDP":0.0428,"HBP":0.0085,"SF":0.0209},"zones":{"heart":0.22,"shadow":0.48,"chase":0.22,"waste":0.08}}},"overall":{"pa":565,"avg":0.227,"obp":0.292,"slg":0.312,"k_pct":0.227,"bb_pct":0.08,"hard_hit":0.376}}}};

const SUPABASE_URL = "https://expzaiduzjehvyfclnnj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cHphaWR1emplaHZ5ZmNsbm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTUwNTQsImV4cCI6MjA4ODI3MTA1NH0.ZZrWRASkBWha6XDuw23bazoXK224diM0HTlgPkdLCy0";
const H = (x={}) => ({ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":"application/json", ...x });
const sbUp = async (bucket, uid, file, pre="") => {
  const path = `${pre}${uid}-${Date.now()}.${file.name.split(".").pop()}`;
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, { method:"POST", headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":file.type }, body:file });
  if (!r.ok) { console.error("upload fail", bucket, await r.text()); return null; }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};
const sb = {
  get:   async (t,q="")    => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{headers:H()}); if(!r.ok){console.error("sb.get",t,await r.text());return null;} return r.json(); } catch(e){console.error(e);return null;} },
  post:  async (t,b)       => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:H({Prefer:"return=representation"}),body:JSON.stringify(b)}); if(!r.ok){console.error("sb.post",t,await r.text());return null;} return r.json(); } catch(e){console.error(e);return null;} },
  patch: async (t,q,b)     => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{method:"PATCH",headers:H({Prefer:"return=representation"}),body:JSON.stringify(b)}); return r.ok?r.json():null; } catch(e){console.error(e);return null;} },
  del:   async (t,q)       => { try { await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{method:"DELETE",headers:H()}); } catch(e){console.error(e);} },
  upsert:async (t,b,conflict="id") => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:H({"Prefer":`resolution=merge-duplicates,return=representation`,"Content-Type":"application/json"}),body:JSON.stringify(b)}); if(!r.ok){console.error("sb.upsert",t,await r.text());return null;} return r.json(); } catch(e){console.error(e);return null;} },
  upload:      (uid,file)       => sbUp("nova-avatars",uid,file,"av-"),
  uploadBanner:(uid,file,slot)  => sbUp("nova-banners",uid,file,`${slot}-`),
  uploadClip:  (uid,file)       => sbUp("nova-clips",uid,file,"cl-"),
};
const getSess  = () => { try { return JSON.parse(localStorage.getItem("nova_session")); } catch { return null; } };
const saveSess = u  => { try { localStorage.setItem("nova_session", JSON.stringify(u)); } catch {} };
const clearSess   = () => { try { localStorage.removeItem("nova_session"); } catch {} };

function useIsMobile(bp=768) {
  const [m,setM] = useState(()=>window.innerWidth<bp);
  useEffect(()=>{ const h=()=>setM(window.innerWidth<bp); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[bp]);
  return m;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#030712;color:#E2E8F0;font-family:'Rajdhani',sans-serif;overflow-x:hidden}
  @keyframes twinkle{0%{opacity:.1;transform:scale(.7)}100%{opacity:1;transform:scale(1.4)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes bellShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(14deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
  @keyframes badgePop{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.15) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
  @keyframes carouselIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
  @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  div:hover>.gif-star{opacity:1!important;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fadeUp{animation:fadeUp .55s ease both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
  .notif-item{animation:slideIn .25s ease both}
  .badge-pop{animation:badgePop .4s cubic-bezier(.34,1.56,.64,1) both}
  .carousel-slide{animation:carouselIn .3s ease both}
  .bell-shake{animation:bellShake .6s ease}
  .msg-in{animation:msgIn .2s ease both}
  .spin{animation:spin 1s linear infinite}
  a{color:inherit;text-decoration:none}
  input,textarea,select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#E2E8F0;font-family:'Rajdhani',sans-serif;font-size:16px;padding:10px 14px;outline:none;width:100%;transition:border-color .2s,box-shadow .2s}
  input:focus,textarea:focus,select:focus{border-color:#00D4FF;box-shadow:0 0 0 3px rgba(0,212,255,.1)}
  input::placeholder,textarea::placeholder{color:#475569}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#030712}::-webkit-scrollbar-thumb{background:rgba(0,212,255,.2);border-radius:4px}
  iframe{display:block}
  .comment-row:hover .del-btn{opacity:1!important}
  .feed-item{scroll-snap-align:start}
  .feed-wrap{scroll-snap-type:y mandatory;overflow-y:scroll}
  .mob-nav{position:fixed;bottom:0;left:0;right:0;z-index:150;background:rgba(3,7,18,.97);backdrop-filter:blur(24px);border-top:1px solid rgba(255,255,255,.08);display:flex;height:58px;padding-bottom:env(safe-area-inset-bottom,0px)}
  .mob-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:none;background:none;cursor:pointer;padding:4px 0;min-width:0}
  .mob-tab-icon{font-size:19px;line-height:1;position:relative;display:inline-block}
  .mob-tab-label{font-size:9px;font-family:'Orbitron',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap}
  @keyframes epicPulse{0%,100%{box-shadow:0 0 14px #A855F7,0 0 4px #A855F7}50%{box-shadow:0 0 34px #A855F7,0 0 60px #A855F788}}
  @keyframes legendFlare{0%,100%{box-shadow:0 0 16px #F59E0B,0 0 6px #F59E0B}33%{box-shadow:0 0 38px #F59E0B,0 0 72px #F59E0BAA,0 0 5px #EF4444}66%{box-shadow:0 0 26px #F59E0B,0 0 48px #F59E0B88}}
  @keyframes rarePulse{0%,100%{box-shadow:0 0 8px #818CF8}50%{box-shadow:0 0 22px #818CF8,0 0 40px #818CF844}}
  @keyframes shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
  @keyframes starPop{0%{transform:translateX(-50%) scale(0);opacity:0}70%{transform:translateX(-50%) scale(1.18)}100%{transform:translateX(-50%) scale(1);opacity:1}}
  @keyframes cardFanOut{from{opacity:0;transform:scale(.55) translateY(50px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes cardDrop{from{opacity:0;transform:scale(.45) translateY(-40px) rotate(-10deg)}to{opacity:1;transform:scale(1) translateY(0) rotate(0deg)}}
  @keyframes burst{0%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(1);opacity:1}100%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(var(--dist)) scale(0);opacity:0}}
`;


const gid = () => "x"+Date.now()+Math.random().toString(36).slice(2,5);
const extractSpotify = u => { const m=u.match(/track\/([A-Za-z0-9]+)/); return m?m[1]:null; };
const extractYT = u => { const m=u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractYouTube = u => { const m=u.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractMedal   = u => { const m=u.match(/clips\/(\d+)/); return m?m[1]:null; };
const fmtTime = ts => { const d=Math.floor((Date.now()-ts)/1000); if(d<60)return"just now"; if(d<3600)return`${Math.floor(d/60)}m ago`; if(d<86400)return`${Math.floor(d/3600)}h ago`; return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtAgo  = fmtTime;
const fmtMsg  = ts => new Date(ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const ROLE_COLOR  = { Owner:"#F59E0B", "Co-owner":"#FB923C", "Basketball League Admin":"#EC4899", Moderator:"#00D4FF", "Event Host":"#A78BFA", Helper:"#34D399" };
const STATUS_META = { online:{color:"#22C55E",label:"Online"}, idle:{color:"#EAB308",label:"Idle"}, dnd:{color:"#EF4444",label:"Do Not Disturb"}, offline:{color:"#6B7280",label:"Offline"} };
const SOCIAL_ICONS = {
  roblox:    <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M117.53 0L0 394.47 394.47 512 512 117.53zm177.39 289.73l-94.66-28.46 28.46-94.66 94.66 28.46z"/></svg>,
  discord:   <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>,
  instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  twitter:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  youtube:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
};
const SOCIAL_COLORS = { roblox:"#E53935", discord:"#5865F2", instagram:"#E1306C", twitter:"#000000", youtube:"#FF0000" };
const SOCIAL_LABELS = { roblox:"Roblox", discord:"Discord", instagram:"Instagram", twitter:"Twitter/X", youtube:"YouTube" };
const MLB_TEAMS = [
  {id:"mlb_nyy",abbr:"NYY",espn:"nyy",name:"Yankees",color:"#003087",div:"AL East"},{id:"mlb_bos",abbr:"BOS",espn:"bos",name:"Red Sox",color:"#BD3039",div:"AL East"},
  {id:"mlb_tor",abbr:"TOR",espn:"tor",name:"Blue Jays",color:"#134A8E",div:"AL East"},{id:"mlb_bal",abbr:"BAL",espn:"bal",name:"Orioles",color:"#DF4601",div:"AL East"},
  {id:"mlb_tb",abbr:"TB",espn:"tb",name:"Rays",color:"#092C5C",div:"AL East"},{id:"mlb_cws",abbr:"CWS",espn:"chw",name:"White Sox",color:"#27251F",div:"AL Central"},
  {id:"mlb_cle",abbr:"CLE",espn:"cle",name:"Guardians",color:"#00385D",div:"AL Central"},{id:"mlb_det",abbr:"DET",espn:"det",name:"Tigers",color:"#0C2340",div:"AL Central"},
  {id:"mlb_kc",abbr:"KC",espn:"kc",name:"Royals",color:"#004687",div:"AL Central"},{id:"mlb_min",abbr:"MIN",espn:"min",name:"Twins",color:"#002B5C",div:"AL Central"},
  {id:"mlb_hou",abbr:"HOU",espn:"hou",name:"Astros",color:"#EB6E1F",div:"AL West"},{id:"mlb_laa",abbr:"LAA",espn:"laa",name:"Angels",color:"#BA0021",div:"AL West"},
  {id:"mlb_oak",abbr:"OAK",espn:"oak",name:"Athletics",color:"#003831",div:"AL West"},{id:"mlb_sea",abbr:"SEA",espn:"sea",name:"Mariners",color:"#0C2C56",div:"AL West"},
  {id:"mlb_tex",abbr:"TEX",espn:"tex",name:"Rangers",color:"#003278",div:"AL West"},{id:"mlb_atl",abbr:"ATL",espn:"atl",name:"Braves",color:"#CE1141",div:"NL East"},
  {id:"mlb_mia",abbr:"MIA",espn:"mia",name:"Marlins",color:"#00A3E0",div:"NL East"},{id:"mlb_nym",abbr:"NYM",espn:"nym",name:"Mets",color:"#002D72",div:"NL East"},
  {id:"mlb_phi",abbr:"PHI",espn:"phi",name:"Phillies",color:"#E81828",div:"NL East"},{id:"mlb_wsh",abbr:"WSH",espn:"wsh",name:"Nationals",color:"#AB0003",div:"NL East"},
  {id:"mlb_chc",abbr:"CHC",espn:"chc",name:"Cubs",color:"#0E3386",div:"NL Central"},{id:"mlb_cin",abbr:"CIN",espn:"cin",name:"Reds",color:"#C6011F",div:"NL Central"},
  {id:"mlb_mil",abbr:"MIL",espn:"mil",name:"Brewers",color:"#12284B",div:"NL Central"},{id:"mlb_pit",abbr:"PIT",espn:"pit",name:"Pirates",color:"#FDB827",div:"NL Central"},
  {id:"mlb_stl",abbr:"STL",espn:"stl",name:"Cardinals",color:"#C41E3A",div:"NL Central"},{id:"mlb_ari",abbr:"ARI",espn:"ari",name:"D-backs",color:"#A71930",div:"NL West"},
  {id:"mlb_col",abbr:"COL",espn:"col",name:"Rockies",color:"#33006F",div:"NL West"},{id:"mlb_lad",abbr:"LAD",espn:"lad",name:"Dodgers",color:"#005A9C",div:"NL West"},
  {id:"mlb_sd",abbr:"SD",espn:"sd",name:"Padres",color:"#2F241D",div:"NL West"},{id:"mlb_sf",abbr:"SF",espn:"sf",name:"Giants",color:"#FD5A1E",div:"NL West"},
];
const NFL_TEAMS = [
  {id:"nfl_buf",abbr:"BUF",espn:"buf",name:"Bills",color:"#00338D",div:"AFC East"},{id:"nfl_mia",abbr:"MIA",espn:"mia",name:"Dolphins",color:"#008E97",div:"AFC East"},
  {id:"nfl_ne",abbr:"NE",espn:"ne",name:"Patriots",color:"#002244",div:"AFC East"},{id:"nfl_nyj",abbr:"NYJ",espn:"nyj",name:"Jets",color:"#125740",div:"AFC East"},
  {id:"nfl_bal",abbr:"BAL",espn:"bal",name:"Ravens",color:"#241773",div:"AFC North"},{id:"nfl_cin",abbr:"CIN",espn:"cin",name:"Bengals",color:"#FB4F14",div:"AFC North"},
  {id:"nfl_cle",abbr:"CLE",espn:"cle",name:"Browns",color:"#FF3C00",div:"AFC North"},{id:"nfl_pit",abbr:"PIT",espn:"pit",name:"Steelers",color:"#FFB612",div:"AFC North"},
  {id:"nfl_hou",abbr:"HOU",espn:"hou",name:"Texans",color:"#03202F",div:"AFC South"},{id:"nfl_ind",abbr:"IND",espn:"ind",name:"Colts",color:"#002C5F",div:"AFC South"},
  {id:"nfl_jax",abbr:"JAX",espn:"jax",name:"Jaguars",color:"#006778",div:"AFC South"},{id:"nfl_ten",abbr:"TEN",espn:"ten",name:"Titans",color:"#0C2340",div:"AFC South"},
  {id:"nfl_den",abbr:"DEN",espn:"den",name:"Broncos",color:"#FB4F14",div:"AFC West"},{id:"nfl_kc",abbr:"KC",espn:"kc",name:"Chiefs",color:"#E31837",div:"AFC West"},
  {id:"nfl_lv",abbr:"LV",espn:"lv",name:"Raiders",color:"#A5ACAF",div:"AFC West"},{id:"nfl_lac",abbr:"LAC",espn:"lac",name:"Chargers",color:"#0080C6",div:"AFC West"},
  {id:"nfl_dal",abbr:"DAL",espn:"dal",name:"Cowboys",color:"#003594",div:"NFC East"},{id:"nfl_nyg",abbr:"NYG",espn:"nyg",name:"Giants",color:"#0B2265",div:"NFC East"},
  {id:"nfl_phi",abbr:"PHI",espn:"phi",name:"Eagles",color:"#004C54",div:"NFC East"},{id:"nfl_wsh",abbr:"WSH",espn:"wsh",name:"Commanders",color:"#5A1414",div:"NFC East"},
  {id:"nfl_chi",abbr:"CHI",espn:"chi",name:"Bears",color:"#0B162A",div:"NFC North"},{id:"nfl_det",abbr:"DET",espn:"det",name:"Lions",color:"#0076B6",div:"NFC North"},
  {id:"nfl_gb",abbr:"GB",espn:"gb",name:"Packers",color:"#203731",div:"NFC North"},{id:"nfl_min",abbr:"MIN",espn:"min",name:"Vikings",color:"#4F2683",div:"NFC North"},
  {id:"nfl_atl",abbr:"ATL",espn:"atl",name:"Falcons",color:"#A71930",div:"NFC South"},{id:"nfl_car",abbr:"CAR",espn:"car",name:"Panthers",color:"#0085CA",div:"NFC South"},
  {id:"nfl_no",abbr:"NO",espn:"no",name:"Saints",color:"#D3BC8D",div:"NFC South"},{id:"nfl_tb",abbr:"TB",espn:"tb",name:"Buccaneers",color:"#D50A0A",div:"NFC South"},
  {id:"nfl_ari",abbr:"ARI",espn:"ari",name:"Cardinals",color:"#97233F",div:"NFC West"},{id:"nfl_lar",abbr:"LAR",espn:"lar",name:"Rams",color:"#003594",div:"NFC West"},
  {id:"nfl_sf",abbr:"SF",espn:"sf",name:"49ers",color:"#AA0000",div:"NFC West"},{id:"nfl_sea",abbr:"SEA",espn:"sea",name:"Seahawks",color:"#002244",div:"NFC West"},
];const NBA_TEAMS = [
  {id:"nba_atl",abbr:"ATL",espn:"atl",name:"Hawks",color:"#C1272D",div:"SE"},{id:"nba_bos",abbr:"BOS",espn:"bos",name:"Celtics",color:"#007A33",div:"Atlantic"},
  {id:"nba_bkn",abbr:"BKN",espn:"bkn",name:"Nets",color:"#000000",div:"Atlantic"},{id:"nba_cha",abbr:"CHA",espn:"cha",name:"Hornets",color:"#1D1160",div:"SE"},
  {id:"nba_chi",abbr:"CHI",espn:"chi",name:"Bulls",color:"#CE1141",div:"Central"},{id:"nba_cle",abbr:"CLE",espn:"cle",name:"Cavaliers",color:"#860038",div:"Central"},
  {id:"nba_dal",abbr:"DAL",espn:"dal",name:"Mavericks",color:"#00538C",div:"SW"},{id:"nba_den",abbr:"DEN",espn:"den",name:"Nuggets",color:"#0E2240",div:"NW"},
  {id:"nba_det",abbr:"DET",espn:"det",name:"Pistons",color:"#C8102E",div:"Central"},{id:"nba_gsw",abbr:"GSW",espn:"gs",name:"Warriors",color:"#1D428A",div:"Pacific"},
  {id:"nba_hou",abbr:"HOU",espn:"hou",name:"Rockets",color:"#CE1141",div:"SW"},{id:"nba_ind",abbr:"IND",espn:"ind",name:"Pacers",color:"#002D62",div:"Central"},
  {id:"nba_lac",abbr:"LAC",espn:"lac",name:"Clippers",color:"#C8102E",div:"Pacific"},{id:"nba_lal",abbr:"LAL",espn:"lal",name:"Lakers",color:"#552583",div:"Pacific"},
  {id:"nba_mem",abbr:"MEM",espn:"mem",name:"Grizzlies",color:"#5D76A9",div:"SW"},{id:"nba_mia",abbr:"MIA",espn:"mia",name:"Heat",color:"#98002E",div:"SE"},
  {id:"nba_mil",abbr:"MIL",espn:"mil",name:"Bucks",color:"#00471B",div:"Central"},{id:"nba_min",abbr:"MIN",espn:"min",name:"Timberwolves",color:"#0C2340",div:"NW"},
  {id:"nba_nop",abbr:"NOP",espn:"no",name:"Pelicans",color:"#0C2340",div:"SW"},{id:"nba_nyk",abbr:"NYK",espn:"ny",name:"Knicks",color:"#006BB6",div:"Atlantic"},
  {id:"nba_okc",abbr:"OKC",espn:"okc",name:"Thunder",color:"#007AC1",div:"NW"},{id:"nba_orl",abbr:"ORL",espn:"orl",name:"Magic",color:"#0077C0",div:"SE"},
  {id:"nba_phi",abbr:"PHI",espn:"phi",name:"76ers",color:"#006BB6",div:"Atlantic"},{id:"nba_phx",abbr:"PHX",espn:"phx",name:"Suns",color:"#1D1160",div:"Pacific"},
  {id:"nba_por",abbr:"POR",espn:"por",name:"Trail Blazers",color:"#E03A3E",div:"NW"},{id:"nba_sac",abbr:"SAC",espn:"sac",name:"Kings",color:"#5A2D81",div:"Pacific"},
  {id:"nba_sas",abbr:"SAS",espn:"sa",name:"Spurs",color:"#C4CED4",div:"SW"},{id:"nba_tor",abbr:"TOR",espn:"tor",name:"Raptors",color:"#CE1141",div:"Atlantic"},
  {id:"nba_uta",abbr:"UTA",espn:"utah",name:"Jazz",color:"#002B5C",div:"NW"},{id:"nba_was",abbr:"WAS",espn:"wsh",name:"Wizards",color:"#002B5C",div:"SE"},
];
const NHL_TEAMS = [
  {id:"nhl_ana",abbr:"ANA",espn:"ana",name:"Ducks",color:"#F47A38",div:"Pacific"},{id:"nhl_bos",abbr:"BOS",espn:"bos",name:"Bruins",color:"#FFB81C",div:"Atlantic"},
  {id:"nhl_buf",abbr:"BUF",espn:"buf",name:"Sabres",color:"#003087",div:"Atlantic"},{id:"nhl_cgy",abbr:"CGY",espn:"cgy",name:"Flames",color:"#C8102E",div:"Pacific"},
  {id:"nhl_car",abbr:"CAR",espn:"car",name:"Hurricanes",color:"#CC0000",div:"Metro"},{id:"nhl_chi",abbr:"CHI",espn:"chi",name:"Blackhawks",color:"#CF0A2C",div:"Central"},
  {id:"nhl_col",abbr:"COL",espn:"col",name:"Avalanche",color:"#6F263D",div:"Central"},{id:"nhl_cbj",abbr:"CBJ",espn:"cbj",name:"Blue Jackets",color:"#002654",div:"Metro"},
  {id:"nhl_dal",abbr:"DAL",espn:"dal",name:"Stars",color:"#006847",div:"Central"},{id:"nhl_det",abbr:"DET",espn:"det",name:"Red Wings",color:"#CE1126",div:"Atlantic"},
  {id:"nhl_edm",abbr:"EDM",espn:"edm",name:"Oilers",color:"#FF4C00",div:"Pacific"},{id:"nhl_fla",abbr:"FLA",espn:"fla",name:"Panthers",color:"#041E42",div:"Atlantic"},
  {id:"nhl_lak",abbr:"LAK",espn:"la",name:"Kings",color:"#111111",div:"Pacific"},{id:"nhl_min",abbr:"MIN",espn:"min",name:"Wild",color:"#154734",div:"Central"},
  {id:"nhl_mtl",abbr:"MTL",espn:"mtl",name:"Canadiens",color:"#AF1E2D",div:"Atlantic"},{id:"nhl_nsh",abbr:"NSH",espn:"nsh",name:"Predators",color:"#FFB81C",div:"Central"},
  {id:"nhl_njd",abbr:"NJD",espn:"nj",name:"Devils",color:"#CE1126",div:"Metro"},{id:"nhl_nyi",abbr:"NYI",espn:"nyi",name:"Islanders",color:"#00539B",div:"Metro"},
  {id:"nhl_nyr",abbr:"NYR",espn:"nyr",name:"Rangers",color:"#0038A8",div:"Metro"},{id:"nhl_ott",abbr:"OTT",espn:"ott",name:"Senators",color:"#C2912C",div:"Atlantic"},
  {id:"nhl_phi",abbr:"PHI",espn:"phi",name:"Flyers",color:"#F74902",div:"Metro"},{id:"nhl_pit",abbr:"PIT",espn:"pit",name:"Penguins",color:"#FCB514",div:"Metro"},
  {id:"nhl_stl",abbr:"STL",espn:"stl",name:"Blues",color:"#002F87",div:"Central"},{id:"nhl_sjs",abbr:"SJS",espn:"sj",name:"Sharks",color:"#006D75",div:"Pacific"},
  {id:"nhl_sea",abbr:"SEA",espn:"sea",name:"Kraken",color:"#001628",div:"Pacific"},{id:"nhl_tbl",abbr:"TBL",espn:"tb",name:"Lightning",color:"#002868",div:"Atlantic"},
  {id:"nhl_tor",abbr:"TOR",espn:"tor",name:"Maple Leafs",color:"#00205B",div:"Atlantic"},{id:"nhl_van",abbr:"VAN",espn:"van",name:"Canucks",color:"#00205B",div:"Pacific"},
  {id:"nhl_vgk",abbr:"VGK",espn:"vgs",name:"Golden Knights",color:"#B4975A",div:"Pacific"},{id:"nhl_was",abbr:"WSH",espn:"wsh",name:"Capitals",color:"#041E42",div:"Metro"},
  {id:"nhl_wpg",abbr:"WPG",espn:"wpg",name:"Jets",color:"#041E42",div:"Central"},
];

const ALL_BADGES = [
  {id:"og",icon:"👑",label:"OG Member",color:"#F59E0B"},{id:"nova_star",icon:"💫",label:"Nova Star",color:"#00D4FF"},
  {id:"watchparty",icon:"🎬",label:"Watch Party Reg",color:"#A78BFA"},{id:"baseball",icon:"⚾",label:"Baseball Fan",color:"#34D399"},
  {id:"gamer",icon:"🎮",label:"Gaming Legend",color:"#F472B6"},{id:"music",icon:"🎵",label:"Music Guru",color:"#818CF8"},
  {id:"social",icon:"🤝",label:"Social Butterfly",color:"#2DD4BF"},{id:"champ",icon:"🏆",label:"Tourney Champ",color:"#FB923C"},
  {id:"earlybird",icon:"🚀",label:"Early Adopter",color:"#C084FC"},{id:"commfave",icon:"🌟",label:"Community Fave",color:"#FBBF24"},
  {id:"predictor",icon:"🎯",label:"Top Predictor",color:"#EF4444"},
];
const BADGES=ALL_BADGES;

// ─── Predictions ───────────────────────────────────────────────────────────────
function PredictPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[sport,setSport]=useState("mlb");
  const[games,setGames]=useState([]);
  const[loading,setLoading]=useState(true);
  const[predictions,setPredictions]=useState({});
  const[expanded,setExpanded]=useState({});

  // Resolve a playerId to a display name using ESPN's athlete endpoint
  const playerNameCache={};
  const resolvePlayer=async(playerId)=>{
    if(!playerId)return null;
    if(playerNameCache[playerId])return playerNameCache[playerId];
    try{
      const d=await(await fetch(`/api/hyperbeam?athlete=${playerId}`)).json();
      const name=d.name||null;
      if(name)playerNameCache[playerId]=name;
      return name;
    }catch{return null;}
  };

  const fetchMLBDetail=async(gameId)=>{
    try{
      const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameId}`);
      const d=await r.json();
      return d;
    }catch{return null;}
  };

  const fetchGames=async s=>{
    setLoading(true);
    try{
      const sportPath=s==="mlb"?"baseball/mlb":s==="nfl"?"football/nfl":s==="nba"?"basketball/nba":"hockey/nhl";
      const data=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard`)).json();
      const evs=await Promise.all((data.events||[]).map(async e=>{
        const comp=e.competitions[0];
        const home=comp.competitors.find(c=>c.homeAway==="home");
        const away=comp.competitors.find(c=>c.homeAway==="away");
        const st=comp.status?.type;
        const statusDetail=comp.status?.type?.shortDetail||"";
        const isMLB=s==="mlb";
        let detail=null;
        // Fetch game detail for all sports — needed for box scores, PBP, scoring plays
        try{
          const dPath=s==="mlb"?"baseball/mlb":s==="nfl"?"football/nfl":s==="nba"?"basketball/nba":"hockey/nhl";
          const dr=await fetch(`https://site.api.espn.com/apis/site/v2/sports/${dPath}/summary?event=${e.id}`);
          if(dr.ok)detail=await dr.json();
        }catch(e2){}
        const situation=detail?.situation;
        const halfMatch=statusDetail.match(/^(Top|Bot|Mid|End)\s/i);
        const inningHalf=halfMatch?halfMatch[1].charAt(0).toUpperCase()+halfMatch[1].slice(1).toLowerCase():"Top";
        const probables=comp.probables||[];
        const awayProb=probables.find(p=>p.homeAway==="away");
        const homeProb=probables.find(p=>p.homeAway==="home");
        const injuries=detail?.injuries||comp.injuries||[];
        const winPitcher=detail?.winPitcher;
        const losePitcher=detail?.losePitcher;
        const savePitcher=detail?.savePitcher;
        const leaders=detail?.leaders||comp.leaders||[];
        const boxTeams=detail?.boxscore?.teams||[];
        const boxPlayers=detail?.boxscore?.players||[];
        const linescore=detail?.linescore||comp.linescore||null;
        const scoringPlays=detail?.scoringPlays||[];
        // ESPN only returns playerId in situation — resolve names via athlete API
        const sitP=situation?.pitcher; const sitB=situation?.batter;
        const [pitcherName,batterName]=await Promise.all([
          resolvePlayer(sitP?.playerId),
          resolvePlayer(sitB?.playerId),
        ]);
        const currentPitcher=sitP?.playerId?{name:pitcherName,summary:""}:null;
        const currentBatter=sitB?.playerId?{name:batterName,summary:""}:null;
        // Period/quarter/period info for NBA/NHL
        const period=comp.status?.period??null;
        const clock=comp.status?.displayClock||"";
        return{
          id:e.id,date:e.date,sport:s,
          home:{name:home?.team?.displayName,abbr:home?.team?.abbreviation,logo:home?.team?.logo,score:home?.score,stats:home?.statistics||[]},
          away:{name:away?.team?.displayName,abbr:away?.team?.abbreviation,logo:away?.team?.logo,score:away?.score,stats:away?.statistics||[]},
          status:statusDetail||"Scheduled",
          started:st?.completed||st?.name==="STATUS_IN_PROGRESS",
          completed:st?.completed||false,
          isMLB,
          outs:situation?.outs??null,balls:situation?.balls??null,strikes:situation?.strikes??null,
          inning:situation?.period??null,inningHalf,
          onFirst:!!situation?.onFirst,onSecond:!!situation?.onSecond,onThird:!!situation?.onThird,
          currentPitcher,currentBatter,
          period,clock,
          awayProb:{name:awayProb?.athlete?.displayName,era:awayProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:awayProb?.athlete?.id},
          homeProb:{name:homeProb?.athlete?.displayName,era:homeProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:homeProb?.athlete?.id},
          injuries,winPitcher:winPitcher?{name:winPitcher.athlete?.displayName,wins:winPitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:winPitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
          losePitcher:losePitcher?{name:losePitcher.athlete?.displayName,wins:losePitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:losePitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
          savePitcher:savePitcher?{name:savePitcher.athlete?.displayName,saves:savePitcher.stats?.find?.(s=>s.name==="saves")?.value}:null,
          leaders,boxTeams,boxPlayers,linescore,scoringPlays,
        };
      }));
      setGames(evs);
    }catch(e){setGames([]);}
    setLoading(false);
  };

  useEffect(()=>{fetchGames(sport);},[sport]);
  useEffect(()=>{const t=setInterval(()=>fetchGames(sport),30000);return()=>clearInterval(t);},[sport]);
  // Auto-refresh at midnight PST (UTC-8) to load new day's schedule
  useEffect(()=>{
    const msPSTnow=()=>{const now=new Date();const pst=new Date(now.toLocaleString("en-US",{timeZone:"America/Los_Angeles"}));return pst;};
    const scheduleNext=()=>{
      const pst=msPSTnow();const next=new Date(pst);next.setDate(next.getDate()+1);next.setHours(0,0,5,0);
      const diff=next-pst;
      return setTimeout(()=>{fetchGames(sport);scheduleNext();},diff);
    };
    const t=scheduleNext();return()=>clearTimeout(t);
  },[sport]);
  useEffect(()=>{if(cu)setPredictions(cu.predictions||{});},[cu?.id]);

  const predict=async(gameId,pick)=>{
    if(!cu)return;
    // Use local predictions state (not cu.predictions) to avoid stale data across multiple picks
    const np={...predictions,[gameId]:pick};
    await sb.patch("nova_users",`?id=eq.${cu.id}`,{predictions:np});
    setUsers(prev=>prev.map(u=>u.id===cu.id?{...u,predictions:np}:u));
    setPredictions(np);
  };

  const toggleExp=id=>setExpanded(prev=>({...prev,[id]:!prev[id]}));

  const StatRow=({label,val,color="#94A3B8"})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
      <span style={{fontSize:11,color:"#475569"}}>{label}</span>
      <span style={{fontSize:12,fontWeight:700,color}}>{val||"—"}</span>
    </div>
  );

  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#fff,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🎯 Predictions</h1>
        <p style={{color:"#475569",fontSize:14,marginBottom:20}}>Pick winners before games start. Locks when game begins. Live scores auto-update every 30s.</p>
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
          {[["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]].map(([s,l])=>(
            <button key={s} onClick={()=>setSport(s)} style={{padding:"8px 20px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${sport===s?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:sport===s?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:sport===s?"#00D4FF":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>
      {loading
        ?<div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}><div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:12}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>FETCHING LIVE DATA...</div></div>
        :games.length===0
          ?<Empty icon={sport==="mlb"?"⚾":sport==="nfl"?"🏈":sport==="nba"?"🏀":"🏒"} msg={`No ${sport.toUpperCase()} games today. Check back later!`}/>
          :<div style={{display:"flex",flexDirection:"column",gap:16}}>
            {games.map(g=>{
              const myPick=predictions[g.id];
              const locked=g.started;
              const homeWin=g.completed&&parseInt(g.home.score)>parseInt(g.away.score);
              const awayWin=g.completed&&parseInt(g.away.score)>parseInt(g.home.score);
              const ph=users.filter(u=>u.predictions?.[g.id]==="home").length;
              const pa=users.filter(u=>u.predictions?.[g.id]==="away").length;
              const tot=ph+pa||1;
              const isExp=expanded[g.id];
              const hasDetail=g.started||g.completed; // show Full Stats for any game that has started/ended
              return(
                <Card key={g.id} style={{padding:"16px 18px"}} hover={false}>
                  {/* Status bar */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:6}}>
                    <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".12em",padding:"3px 10px",borderRadius:20,background:g.completed?"rgba(100,116,139,.15)":g.started?"rgba(34,197,94,.15)":"rgba(0,212,255,.1)",color:g.completed?"#64748B":g.started?"#22C55E":"#00D4FF",border:`1px solid ${g.completed?"rgba(100,116,139,.2)":g.started?"rgba(34,197,94,.3)":"rgba(0,212,255,.25)"}`}}>{g.completed?"✅ FINAL":g.started?`🔴 LIVE · ${g.status}`:`🕐 ${g.status}`}</span>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {myPick&&<span style={{fontSize:11,color:"#64748B",fontFamily:"'Orbitron',sans-serif"}}>Picked: <span style={{color:"#00D4FF"}}>{myPick==="home"?g.home.abbr:g.away.abbr}</span></span>}
                      {hasDetail&&<button onClick={()=>navigate("game",{id:g.id,sport:g.sport})} style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:8,padding:"3px 12px",cursor:"pointer",color:"#00D4FF"}}>📊 Full Stats →</button>}
                    </div>
                  </div>

                  {/* Live MLB situation */}
                  {g.sport==="mlb"&&g.started&&!g.completed&&g.outs!==null&&(
                    <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                      <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>INNING</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.inningHalf} {g.inning}</div>
                      </div>
                      <div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>OUTS</div>
                        <div style={{display:"flex",gap:5,marginTop:4,justifyContent:"center"}}>
                          {[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<g.outs?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${i<g.outs?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>)}
                        </div>
                      </div>
                      <div style={{background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em"}}>COUNT</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.balls??0}-{g.strikes??0}</div>
                      </div>
                      {/* Base runners diamond */}
                      <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",letterSpacing:".1em",marginBottom:4}}>BASES</div>
                        <div style={{position:"relative",width:36,height:36,margin:"0 auto"}}>
                          {/* Diamond layout: 2B top, 3B left, 1B right */}
                          <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%) rotate(45deg)",width:13,height:13,background:g.onSecond?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onSecond?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                          <div style={{position:"absolute",top:"50%",left:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onThird?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onThird?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                          <div style={{position:"absolute",top:"50%",right:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onFirst?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onFirst?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* MLB pitcher/batter row */}
                  {g.sport==="mlb"&&g.started&&!g.completed&&(g.currentPitcher?.name||g.currentBatter?.name)&&(
                    <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
                      {g.currentPitcher?.name&&(
                        <div style={{background:"rgba(0,212,255,.07)",border:"1px solid rgba(0,212,255,.18)",borderRadius:10,padding:"6px 14px",textAlign:"center",minWidth:120}}>
                          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em",marginBottom:2}}>⚾ PITCHING</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{g.currentPitcher.name}</div>
                          {g.currentPitcher.summary&&<div style={{fontSize:10,color:"#64748B",marginTop:1}}>{g.currentPitcher.summary}</div>}
                        </div>
                      )}
                      {g.currentBatter?.name&&(
                        <div style={{background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.18)",borderRadius:10,padding:"6px 14px",textAlign:"center",minWidth:120}}>
                          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em",marginBottom:2}}>🏏 AT BAT</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{g.currentBatter.name}</div>
                          {g.currentBatter.summary&&<div style={{fontSize:10,color:"#64748B",marginTop:1}}>{g.currentBatter.summary}</div>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live NBA/NHL situation */}
                  {(g.sport==="nba"||g.sport==="nhl")&&g.started&&!g.completed&&g.period&&(
                    <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,alignItems:"center"}}>
                      <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>{g.sport==="nba"?"QUARTER":"PERIOD"}</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.period}</div>
                      </div>
                      {g.clock&&<div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>CLOCK</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.clock}</div>
                      </div>}
                    </div>
                  )}

                  {/* Team matchup */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:mob?8:12,alignItems:"center"}}>
                    <button onClick={()=>!locked&&predict(g.id,"away")} disabled={locked} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:mob?"12px 8px":"16px 12px",borderRadius:12,border:`2px solid ${myPick==="away"?"#00D4FF":awayWin?"#22C55E":"rgba(255,255,255,.08)"}`,background:myPick==="away"?"rgba(0,212,255,.1)":awayWin?"rgba(34,197,94,.08)":"rgba(255,255,255,.02)",cursor:locked?"default":"pointer",transition:"all .2s",opacity:g.completed&&homeWin?.5:1}}>
                      {g.away.logo&&<img src={g.away.logo} width={mob?36:48} height={mob?36:48} style={{objectFit:"contain"}}/>}
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:700,color:myPick==="away"?"#00D4FF":"#E2E8F0"}}>{g.away.abbr}</div>
                      {g.started&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:900,color:awayWin?"#22C55E":"#E2E8F0"}}>{g.away.score||0}</div>}
                      {!locked&&<div style={{fontSize:10,color:"#475569"}}>{Math.round(pa/tot*100)}% pick</div>}
                    </button>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:"#334155",letterSpacing:".08em"}}>VS</div>
                      {locked&&!g.completed&&<div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",marginTop:4}}>LIVE</div>}
                    </div>
                    <button onClick={()=>!locked&&predict(g.id,"home")} disabled={locked} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:mob?"12px 8px":"16px 12px",borderRadius:12,border:`2px solid ${myPick==="home"?"#00D4FF":homeWin?"#22C55E":"rgba(255,255,255,.08)"}`,background:myPick==="home"?"rgba(0,212,255,.1)":homeWin?"rgba(34,197,94,.08)":"rgba(255,255,255,.02)",cursor:locked?"default":"pointer",transition:"all .2s",opacity:g.completed&&awayWin?.5:1}}>
                      {g.home.logo&&<img src={g.home.logo} width={mob?36:48} height={mob?36:48} style={{objectFit:"contain"}}/>}
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:700,color:myPick==="home"?"#00D4FF":"#E2E8F0"}}>{g.home.abbr}</div>
                      {g.started&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:900,color:homeWin?"#22C55E":"#E2E8F0"}}>{g.home.score||0}</div>}
                      {!locked&&<div style={{fontSize:10,color:"#475569"}}>{Math.round(ph/tot*100)}% pick</div>}
                    </button>
                  </div>

                  {/* Community pick bar */}
                  {!locked&&(
                    <div style={{marginTop:12}}>
                      <div style={{display:"flex",height:4,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,.06)"}}>
                        <div style={{width:`${Math.round(pa/tot*100)}%`,background:"linear-gradient(90deg,#8B5CF6,#00D4FF)",transition:"width .4s"}}/>
                        <div style={{flex:1,background:"linear-gradient(90deg,#00D4FF,#22C55E)",opacity:.6}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#334155",marginTop:4}}>
                        <span>{pa} picked {g.away.abbr}</span><span>{ph} picked {g.home.abbr}</span>
                      </div>
                    </div>
                  )}

                </Card>
              );
            })}
          </div>
      }
    </div>
  );
}

// ─── Leaderboard ───────────────────────────────────────────────────────────────

// ─── Game Detail Page ──────────────────────────────────────────────────────────
function GameDetailPage({gameId,sport,navigate}){
  const mob=useIsMobile();
  const[game,setGame]=useState(null);
  const[loading,setLoading]=useState(true);
  const[pbp,setPbp]=useState([]); // live play by play
  const[pbpLoading,setPbpLoading]=useState(false);
  const[pbpTab,setPbpTab]=useState("pbp"); // pbp | scoring | inning
  const[pbpInning,setPbpInning]=useState(null); // null=all, or inning number
  const[rawAtBats,setRawAtBats]=useState([]); // MLB: full at-bat objects with pitches
  const pbpRef=useRef(null);

  const loadPbp=async(gameState)=>{
    if(sport!=="mlb"&&sport!=="nba"&&sport!=="nhl")return;
    // gameState param lets us pass game data before state settles
    const gData=gameState||game;
    setPbpLoading(true);
    try{
      if(sport==="mlb"){
        let gamePk=gameId;
        let mlbData=null;
        // Attempt 1: ESPN gameId IS often the MLB gamePk directly — try it
        try{
          const r=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),10000);return c.signal;})()});
          if(r.ok){const d=await r.json();if(d?.liveData?.plays?.allPlays?.length>0)mlbData=d;}
        }catch(e){}
        // Attempt 2: look up real gamePk via ESPN summary externalIds
        if(!mlbData){
          try{
            const eR=await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameId}`);
            if(eR.ok){
              const eD=await eR.json();
              const extId=eD?.header?.competitions?.[0]?.externalIds?.find(x=>
                x.provider==="mlbgamepk"||x.provider==="gamepk"||x.provider==="mlb");
              if(extId?.value&&String(extId.value)!==String(gameId)){
                gamePk=extId.value;
                const r2=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),10000);return c.signal;})()});
                if(r2.ok)mlbData=await r2.json();
              }
            }
          }catch(e){}
        }
        // Attempt 3: search MLB schedule — include ALL game types (spring training=S, regular=R, postseason=P etc)
        if(!mlbData){
          try{
            const today=new Date();
            for(let d=0;d<=5&&!mlbData;d++){
              const dt=new Date(today);dt.setDate(dt.getDate()-d);
              const dateStr=dt.toISOString().slice(0,10);
              // S=spring training, R=regular, P=postseason, F=wild card, D=division, L=LCS, W=world series
              const sR=await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&gameType=S,R,P,F,D,L,W`);
              if(!sR.ok)continue;
              const sD=await sR.json();
              const allGames=(sD.dates?.[0]?.games||[]);
              if(!allGames.length)continue;
              // Match by team name keywords if we have game data
              let match=null;
              if(gData?.home?.name){
                const hKw=(gData.home.name||"").split(" ").pop().toLowerCase();
                const aKw=(gData.away?.name||"").split(" ").pop().toLowerCase();
                match=allGames.find(g=>{
                  const h=(g.teams?.home?.team?.name||"").toLowerCase();
                  const a=(g.teams?.away?.team?.name||"").toLowerCase();
                  return(h.includes(hKw)||a.includes(hKw))&&(h.includes(aKw)||a.includes(aKw));
                });
              }
              // If no name match, try all games on that date (pick one that has plays)
              const candidates=match?[match]:allGames.slice(0,10);
              for(const cg of candidates){
                if(!cg.gamePk)continue;
                try{
                  const r3=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${cg.gamePk}/feed/live`,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),10000);return c.signal;})()});
                  if(!r3.ok)continue;
                  const d3=await r3.json();
                  if(d3?.liveData?.plays?.allPlays?.length>0){mlbData=d3;break;}
                }catch(e){}
              }
            }
          }catch(e){}
        }
        if(mlbData){
          const allAtBats=mlbData.liveData?.plays?.allPlays||[];
          // Store full at-bat data including pitches
          const mapped=allAtBats.map(ab=>({
            id:ab.atBatIndex,
            inningNum:ab.about?.inning||1,
            inning:`${ab.about?.halfInning==="top"?"▲":"▼"} ${ab.about?.inning}`,
            isTop:ab.about?.halfInning==="top",
            batter:ab.matchup?.batter?.fullName||"",
            pitcher:ab.matchup?.pitcher?.fullName||"",
            event:ab.result?.event||"",
            desc:ab.result?.description||"",
            rbi:ab.result?.rbi||0,
            outs:ab.count?.outs??null,
            isScoring:ab.result?.rbi>0||["Home Run","Grand Slam","Stolen Base Home"].includes(ab.result?.event||""),
            isComplete:ab.about?.isComplete||false,
            pitches:(ab.pitchIndex||[]).map(pi=>{
              const p=ab.playEvents?.[pi];
              if(!p)return null;
              const pd=p.pitchData||{};
              const hd=p.hitData||{};
              return{
                num:p.pitchNumber||pi+1,
                type:p.details?.type?.description||p.type?.description||"",
                call:p.details?.call?.description||p.details?.description||"",
                callCode:p.details?.call?.code||p.details?.code||"",
                velocity:pd.startSpeed?Math.round(pd.startSpeed):null,
                spinRate:pd.breaks?.spinRate?Math.round(pd.breaks.spinRate):null,
                px:pd.coordinates?.pX??null, // horizontal plate position
                pz:pd.coordinates?.pZ??null, // vertical plate position
                szTop:pd.strikeZoneTop??3.5,
                szBot:pd.strikeZoneBottom??1.5,
                // Hit data
                hitDist:hd.totalDistance?Math.round(hd.totalDistance):null,
                hitAngle:hd.launchAngle?Math.round(hd.launchAngle):null,
                exitVelo:hd.launchSpeed?Math.round(hd.launchSpeed):null,
                hitX:hd.coordinates?.coordX??null,
                hitY:hd.coordinates?.coordY??null,
                isInPlay:p.type==="X",
                isBall:p.type==="B",
                isStrike:p.type==="S",
                balls:p.count?.balls??0,
                strikes:p.count?.strikes??0,
              };
            }).filter(Boolean),
          }));
          setRawAtBats(mapped.slice().reverse()); // newest first
          // Simple PBP list for non-pitch view
          setPbp(mapped.slice().reverse().map(ab=>({
            id:ab.id,inning:ab.inning,inningNum:ab.inningNum,
            batter:ab.batter,pitcher:ab.pitcher,event:ab.event,
            desc:ab.desc,rbi:ab.rbi,outs:ab.outs,
            isScoring:ab.isScoring,isComplete:ab.isComplete,
          })));
        }
      } else if(sport==="nba"){
        const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`);
        if(r.ok){
          const d=await r.json();
          const raw=d?.plays||[];
          setPbp(raw.slice().reverse().map((p,i)=>({
            id:i,
            period:p.period?.displayValue||`Q${p.period?.number||""}`,
            periodNum:p.period?.number||0,
            clock:p.clock?.displayValue||"",
            team:p.team?.abbreviation||p.team?.displayName||"",
            desc:p.text||p.description||"",
            awayScore:p.awayScore??null,
            homeScore:p.homeScore??null,
            isScoring:p.scoringPlay||false,
            type:p.type?.text||p.type?.displayName||"",
          })));
        }
      } else if(sport==="nhl"){
        const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=${gameId}`);
        if(r.ok){
          const d=await r.json();
          // ESPN NHL: plays array OR scoringPlays for goals
          const raw=d?.plays||[];
          // If no plays, fall back to scoring plays from main game data
          const mapped=raw.length>0?raw.slice().reverse().map((p,i)=>({
            id:i,
            period:p.period?.displayValue||`P${p.period?.number||""}`,
            periodNum:p.period?.number||0,
            clock:p.clock?.displayValue||"",
            team:p.team?.abbreviation||p.team?.displayName||"",
            desc:p.text||p.description||"",
            awayScore:p.awayScore??null,
            homeScore:p.homeScore??null,
            isScoring:!!(p.scoringPlay||p.type?.text==="Goal"||p.type?.id==="goal"||
              (p.text||"").toLowerCase().includes("goal")||(p.type?.description||"").toLowerCase().includes("goal")),
            type:p.type?.text||p.type?.displayName||"",
          })):[];
          // If no ESPN plays, build from game scoring plays
          if(!mapped.length&&game?.scoringPlays?.length){
            const fallback=game.scoringPlays.map((sp,i)=>({
              id:i,period:sp.period||"",periodNum:1,clock:sp.clock||"",
              team:sp.team||"",desc:sp.desc||"",
              awayScore:sp.awayScore??null,homeScore:sp.homeScore??null,
              isScoring:true,type:"Goal",
            }));
            setPbp(fallback);
          } else {
            setPbp(mapped);
          }
        }
      }
    }catch(e){console.warn("PBP load error:",e.message);}
    setPbpLoading(false);
  };

  // Inning/period list for navigation
  const pbpPeriods=useMemo(()=>{
    if(!pbp.length)return[];
    const seen=new Set();const list=[];
    pbp.forEach(p=>{
      const key=sport==="mlb"?p.inningNum:p.periodNum;
      if(key!=null&&!seen.has(key)){seen.add(key);list.push(key);}
    });
    return list.sort((a,b)=>a-b);
  },[pbp,sport]);

  const pbpFiltered=useMemo(()=>{
    let list=pbp;
    if(pbpInning!==null){
      list=list.filter(p=>(sport==="mlb"?p.inningNum:p.periodNum)===pbpInning);
    }
    if(pbpTab==="scoring")list=list.filter(p=>p.isScoring);
    return list;
  },[pbp,pbpInning,pbpTab,sport]);

  // Pitch zone colors
  const pitchColor=(call)=>{
    const c=(call||"").toLowerCase();
    if(c.includes("ball")||c==="b")return"#3B82F6";
    if(c.includes("strike")||c==="s"||c==="c"||c==="f"||c==="t")return"#EF4444";
    if(c.includes("in play")||c==="x")return"#22C55E";
    return"#94A3B8";
  };



  useEffect(()=>{load();},[gameId]);
  useEffect(()=>{
    // Refresh game data every 30s, PBP every 20s for live games
    const t=setInterval(()=>load(true),30000);
    return()=>clearInterval(t);
  },[gameId]);
  useEffect(()=>{
    // loadPbp with no args on mount — game state may not be ready yet, 
    // load() will call it again with fresh game data
    loadPbp();
    const interval=sport==="mlb"||sport==="nba"||sport==="nhl"?
      setInterval(()=>loadPbp(),20000):null;
    return()=>{if(interval)clearInterval(interval);};
  },[gameId,sport]);

  const sportPath=sport==="mlb"?"baseball/mlb":sport==="nfl"?"football/nfl":sport==="nba"?"basketball/nba":"hockey/nhl";

  const load=async(quiet=false)=>{
    if(!quiet)setLoading(true);
    try{
      const d=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`)).json();
      const scoreboard=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard`)).json();
      const ev=scoreboard.events?.find(e=>e.id===gameId);
      const comp=ev?.competitions?.[0];
      const home=comp?.competitors?.find(c=>c.homeAway==="home");
      const away=comp?.competitors?.find(c=>c.homeAway==="away");
      const st=comp?.status?.type;
      const statusDetail=comp?.status?.type?.shortDetail||"";
      const period=comp?.status?.period??null;
      const clock=comp?.status?.displayClock||"";
      const halfMatch=statusDetail.match(/^(Top|Bot|Mid|End)\s/i);
      const inningHalf=halfMatch?halfMatch[1].charAt(0).toUpperCase()+halfMatch[1].slice(1).toLowerCase():"Top";
      const sit=d?.situation;
      const probables=comp?.probables||[];
      const awayProb=probables.find(p=>p.homeAway==="away");
      const homeProb=probables.find(p=>p.homeAway==="home");
      // Build normalized scoring plays for all sports
      // ESPN returns different period formats: object with displayValue, or plain number
      const rawPlays=d?.scoringPlays||[];
      const normPeriod=(sp)=>{
        const p=sp.period;
        if(!p)return sp.periodText||"";
        if(typeof p==="number")return sport==="nba"?`Q${p}`:sport==="nhl"?`P${p}`:`Q${p}`;
        if(p.displayValue)return p.displayValue;
        if(p.number){
          if(sport==="nba")return `Q${p.number}`;
          if(sport==="nhl")return `P${p.number}`;
          if(sport==="mlb")return p.type==="B"?`Bot ${p.number}`:`Top ${p.number}`;
          return `Q${p.number}`;
        }
        return p.text||"";
      };
      const normClock=(sp)=>{
        const c=sp.clock;
        if(!c)return "";
        if(typeof c==="string")return c;
        return c.displayValue||c.value||"";
      };
      const scoringPlays=rawPlays.map(sp=>({
        period:normPeriod(sp),
        clock:normClock(sp),
        team:sp.team?.abbreviation||sp.team?.shortDisplayName||"",
        desc:sp.text||sp.description||sp.headline||sp.summary||"",
        awayScore:sp.awayScore??null,
        homeScore:sp.homeScore??null,
        type:sp.scoringType?.displayName||sp.type?.text||sp.type?.name||"",
      }));

      // MLB live pitcher/batter
      // ESPN stores pitcher/batter stats in statistics[] not a summary string
      // ESPN only returns playerId in situation — resolve to names via athlete API
      const gdP=sit?.pitcher; const gdB=sit?.batter;
      const [gdPitcherName,gdBatterName]=await Promise.all([
        (async(id)=>{if(!id)return null;try{const d=await(await fetch(`/api/hyperbeam?athlete=${id}`)).json();return d.name||null;}catch{return null;}})(gdP?.playerId),
        (async(id)=>{if(!id)return null;try{const d=await(await fetch(`/api/hyperbeam?athlete=${id}`)).json();return d.name||null;}catch{return null;}})(gdB?.playerId),
      ]);
      const currentPitcher=gdP?.playerId?{name:gdPitcherName,summary:""}:null;
      const currentBatter=gdB?.playerId?{name:gdBatterName,summary:""}:null;

      // Build per-period linescore for NBA/NHL/NFL (ESPN returns comp.linescores[])
      const compLinescores=comp?.linescores||[];
      // For MLB use d.linescore; for others build from comp.linescores per competitor
      const linescoreNonMLB=compLinescores.length>0?{
        columns:compLinescores.map((_,i)=>({label:sport==="nba"?`Q${i+1}`:sport==="nhl"?`P${i+1}`:`Q${i+1}`})).concat([{label:"T"}]),
        rows:[
          {label:away?.team?.abbreviation,columns:[...(away?.linescores||[]).map(l=>({value:l.value??"-"})),{value:away?.score||"",bold:true}]},
          {label:home?.team?.abbreviation,columns:[...(home?.linescores||[]).map(l=>({value:l.value??"-"})),{value:home?.score||"",bold:true}]},
        ]
      }:null;

      setGame({
        id:gameId,sport,
        home:{name:home?.team?.displayName,abbr:home?.team?.abbreviation,logo:home?.team?.logo,score:home?.score,id:home?.team?.id},
        away:{name:away?.team?.displayName,abbr:away?.team?.abbreviation,logo:away?.team?.logo,score:away?.score,id:away?.team?.id},
        status:statusDetail||"Scheduled",
        started:st?.completed||st?.name==="STATUS_IN_PROGRESS",
        completed:st?.completed||false,
        period,clock,
        inning:sit?.period??null,inningHalf,
        outs:sit?.outs??null,balls:sit?.balls??null,strikes:sit?.strikes??null,
        onFirst:!!sit?.onFirst,onSecond:!!sit?.onSecond,onThird:!!sit?.onThird,
        currentPitcher,currentBatter,
        awayProb:{name:awayProb?.athlete?.displayName,era:awayProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:awayProb?.athlete?.id},
        homeProb:{name:homeProb?.athlete?.displayName,era:homeProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:homeProb?.athlete?.id},
        leaders:d?.leaders||comp?.leaders||[],
        boxTeams:d?.boxscore?.teams||[],
        boxPlayers:d?.boxscore?.players||[],
        linescore:sport==="mlb"?(d?.linescore||comp?.linescore||null):linescoreNonMLB,
        scoringPlays,
        winPitcher:d?.winPitcher?{name:d.winPitcher.athlete?.displayName,wins:d.winPitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:d.winPitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
        losePitcher:d?.losePitcher?{name:d.losePitcher.athlete?.displayName,wins:d.losePitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:d.losePitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
        savePitcher:d?.savePitcher?{name:d.savePitcher.athlete?.displayName,saves:d.savePitcher.stats?.find?.(s=>s.name==="saves")?.value}:null,
        injuries:d?.injuries||[],
        drives:d?.drives?.previous||[],
      });
      // Call loadPbp with fresh game data so attempt 3 has team names
      const freshGame={home:{name:home?.team?.displayName},away:{name:away?.team?.displayName}};
      loadPbp(freshGame);
    }catch(e){console.error(e);}
    if(!quiet)setLoading(false);
  };

  if(loading)return <div style={{textAlign:"center",padding:"80px 20px",color:"#334155"}}><div className="spin" style={{fontSize:32,display:"inline-block",marginBottom:12}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>LOADING GAME DATA...</div></div>;
  if(!game)return <div style={{textAlign:"center",padding:80,color:"#334155"}}>Game not found.</div>;

  const g=game;
  const sportIcon={mlb:"⚾",nfl:"🏈",nba:"🏀",nhl:"🏒"}[g.sport]||"🏆";

  const SLabel=({children,color="#00D4FF"})=>(
    <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color,marginBottom:8,letterSpacing:".12em",borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:6}}>{children}</div>
  );
  const StatRow=({l,av,hv})=>(
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)",alignItems:"center"}}>
      <div style={{textAlign:"right",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{av||"—"}</div>
      <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",textAlign:"center",minWidth:90,padding:"0 4px"}}>{l}</div>
      <div style={{textAlign:"left",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{hv||"—"}</div>
    </div>
  );

  return(
    <div style={{maxWidth:860,margin:"0 auto",padding:"44px 16px 80px"}}>
      {/* Back */}
      <button onClick={()=>navigate("predict")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:12,marginBottom:20,padding:0}}>← Back to Predictions</button>

      {/* Header scoreboard */}
      <Card style={{padding:"20px 24px",marginBottom:20}} hover={false}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".12em",padding:"3px 12px",borderRadius:20,background:g.completed?"rgba(100,116,139,.15)":g.started?"rgba(34,197,94,.15)":"rgba(0,212,255,.1)",color:g.completed?"#64748B":g.started?"#22C55E":"#00D4FF",border:`1px solid ${g.completed?"rgba(100,116,139,.2)":g.started?"rgba(34,197,94,.3)":"rgba(0,212,255,.25)"}`}}>
            {g.completed?"✅ FINAL":g.started?`🔴 LIVE · ${g.status}`:`🕐 ${g.status}`}
          </span>
        </div>

        {/* MLB live situation */}
        {g.sport==="mlb"&&g.started&&!g.completed&&g.outs!==null&&(
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>INNING</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.inningHalf} {g.inning}</div>
            </div>
            <div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>OUTS</div>
              <div style={{display:"flex",gap:5,marginTop:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<g.outs?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${i<g.outs?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>)}</div>
            </div>
            <div style={{background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em"}}>COUNT</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.balls??0}-{g.strikes??0}</div>
            </div>
            <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",letterSpacing:".1em",marginBottom:4}}>BASES</div>
              <div style={{position:"relative",width:36,height:36,margin:"0 auto"}}>
                <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%) rotate(45deg)",width:13,height:13,background:g.onSecond?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onSecond?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                <div style={{position:"absolute",top:"50%",left:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onThird?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onThird?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                <div style={{position:"absolute",top:"50%",right:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onFirst?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onFirst?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
              </div>
            </div>
          </div>
        )}
        {/* MLB live pitcher/batter */}
        {g.sport==="mlb"&&g.started&&!g.completed&&(g.currentPitcher?.name||g.currentBatter?.name)&&(
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
            {g.currentPitcher?.name&&(
              <div style={{background:"rgba(0,212,255,.07)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"8px 18px",textAlign:"center",minWidth:140}}>
                <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em",marginBottom:3}}>⚾ PITCHING</div>
                <div style={{fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{g.currentPitcher.name}</div>
                {g.currentPitcher.summary&&<div style={{fontSize:11,color:"#64748B",marginTop:2}}>{g.currentPitcher.summary}</div>}
              </div>
            )}
            {g.currentBatter?.name&&(
              <div style={{background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.2)",borderRadius:10,padding:"8px 18px",textAlign:"center",minWidth:140}}>
                <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em",marginBottom:3}}>🏏 AT BAT</div>
                <div style={{fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{g.currentBatter.name}</div>
                {g.currentBatter.summary&&<div style={{fontSize:11,color:"#64748B",marginTop:2}}>{g.currentBatter.summary}</div>}
              </div>
            )}
          </div>
        )}

        {/* NBA/NHL live period */}
        {(g.sport==="nba"||g.sport==="nhl")&&g.started&&!g.completed&&g.period&&(
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14}}>
            <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>{g.sport==="nba"?"QUARTER":"PERIOD"}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.period}</div>
            </div>
            {g.clock&&<div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>CLOCK</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.clock}</div>
            </div>}
          </div>
        )}

        {/* Scoreboard */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            {g.away.logo&&<img src={g.away.logo} width={mob?48:64} height={mob?48:64} style={{objectFit:"contain"}}/>}
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:700,color:"#E2E8F0"}}>{g.away.abbr}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?28:40,fontWeight:900,color:"#E2E8F0"}}>{g.started||g.completed?g.away.score||0:"—"}</div>
            <div style={{fontSize:10,color:"#475569"}}>{g.away.name}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color:"#1E293B",letterSpacing:".08em"}}>VS</div>
            <div style={{fontSize:22,marginTop:4}}>{sportIcon}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            {g.home.logo&&<img src={g.home.logo} width={mob?48:64} height={mob?48:64} style={{objectFit:"contain"}}/>}
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:700,color:"#E2E8F0"}}>{g.home.abbr}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?28:40,fontWeight:900,color:"#E2E8F0"}}>{g.started||g.completed?g.home.score||0:"—"}</div>
            <div style={{fontSize:10,color:"#475569"}}>{g.home.name}</div>
          </div>
        </div>
      </Card>

      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* MLB probable starters */}
        {g.sport==="mlb"&&!g.started&&(g.awayProb?.name||g.homeProb?.name)&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel>⚾ PROBABLE STARTERS</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{side:"Away",team:g.away.abbr,p:g.awayProb},{side:"Home",team:g.home.abbr,p:g.homeProb}].map(({side,team,p})=>(
                <div key={side} style={{background:"rgba(255,255,255,.03)",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>{team} ({side})</div>
                  <div onClick={p?.playerId?()=>navigate("stats",{playerId:p.playerId,sport:g.sport}):undefined}
                    style={{fontSize:15,fontWeight:700,color:p?.playerId?"#00D4FF":"#E2E8F0",cursor:p?.playerId?"pointer":"default"}}>{p?.name||"TBD"}</div>
                  {p?.era&&<div style={{fontSize:12,color:"#94A3B8",marginTop:2}}>ERA: {p.era}</div>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* MLB pitching decision */}
        {g.sport==="mlb"&&g.completed&&(g.winPitcher||g.losePitcher||g.savePitcher)&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#22C55E">🏆 PITCHING DECISION</SLabel>
            {g.winPitcher&&<StatRow l={`W: ${g.winPitcher.name}`} av={`${g.winPitcher.wins??"-"}-${g.winPitcher.losses??"-"}`} hv="WIN"/>}
            {g.losePitcher&&<StatRow l={`L: ${g.losePitcher.name}`} av={`${g.losePitcher.wins??"-"}-${g.losePitcher.losses??"-"}`} hv="LOSS"/>}
            {g.savePitcher&&<StatRow l={`SV: ${g.savePitcher.name}`} av={`${g.savePitcher.saves??"-"} SV`} hv="SAVE"/>}
          </Card>
        )}

        {/* Player of the game */}
        {g.completed&&g.leaders?.length>0&&(()=>{
          const potg=g.leaders.reduce((best,l)=>{const v=parseFloat((l.displayValue||"0").replace(/[^0-9.]/g,""))||0;const bv=parseFloat((best?.displayValue||"0").replace(/[^0-9.]/g,""))||0;return v>bv?l:best;},g.leaders[0]);
          return(
            <Card style={{padding:"16px 18px"}} hover={false}>
              <SLabel color="#F59E0B">⭐ TOP PERFORMERS</SLabel>
              {potg&&<div style={{background:"linear-gradient(135deg,rgba(245,158,11,.15),rgba(251,191,36,.07))",border:"1px solid rgba(245,158,11,.3)",borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:28}}>🌟</div>
                <div>
                  <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",letterSpacing:".12em",marginBottom:2}}>PLAYER OF THE GAME</div>
                  <div style={{fontSize:15,fontWeight:700,color:"#E2E8F0"}}>{potg.athlete?.displayName||potg.displayName||potg.name||"—"}</div>
                  <div style={{fontSize:13,color:"#F59E0B",fontWeight:600}}>{potg.displayValue||potg.value||"—"}</div>
                </div>
              </div>}
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {g.leaders.slice(0,10).map((l,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{fontSize:12,color:"#94A3B8"}}>{l.athlete?.displayName||l.displayName||l.name||"—"}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"#F59E0B"}}>{l.displayValue||l.value||"—"}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}

        {/* MLB linescore */}
        {g.sport==="mlb"&&(g.started||g.completed)&&g.linescore?.columns?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel>📊 LINE SCORE</SLabel>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:320}}>
                <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}><td style={{padding:"4px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>TEAM</td>{(g.linescore.columns||[]).map((cl,i)=><td key={i} style={{padding:"4px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>{cl.label||cl.value||i+1}</td>)}</tr></thead>
                <tbody>{(g.linescore.rows||[]).map((row,ri)=>(<tr key={ri} style={{background:ri%2===0?"rgba(255,255,255,.02)":"transparent"}}><td style={{padding:"4px 8px",color:"#E2E8F0",fontWeight:700,fontFamily:"'Orbitron',sans-serif",fontSize:10}}>{row.label||row.team||""}</td>{(row.columns||[]).map((cell,ci)=>(<td key={ci} style={{padding:"4px 6px",textAlign:"center",color:cell.bold?"#22C55E":"#94A3B8",fontWeight:cell.bold?700:400}}>{cell.value??""}</td>))}</tr>))}</tbody>
              </table>
            </div>
          </Card>
        )}

        {/* NBA/NHL/NFL period scores linescore */}
        {g.sport!=="mlb"&&(g.started||g.completed)&&g.linescore?.columns?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color={g.sport==="nba"?"#F59E0B":g.sport==="nhl"?"#00D4FF":"#22C55E"}>
              {g.sport==="nba"?"🏀 QUARTER SCORES":g.sport==="nhl"?"🏒 PERIOD SCORES":"🏈 QUARTER SCORES"}
            </SLabel>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:280}}>
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    <td style={{padding:"5px 10px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>TEAM</td>
                    {(g.linescore.columns||[]).map((cl,i)=>(
                      <td key={i} style={{padding:"5px 8px",textAlign:"center",color:cl.label==="T"?"#22C55E":"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:cl.label==="T"?700:400}}>{cl.label}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(g.linescore.rows||[]).map((row,ri)=>(
                    <tr key={ri} style={{background:ri%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <td style={{padding:"6px 10px",color:"#E2E8F0",fontWeight:700,fontFamily:"'Orbitron',sans-serif",fontSize:11}}>{row.label}</td>
                      {(row.columns||[]).map((cell,ci)=>(
                        <td key={ci} style={{padding:"6px 8px",textAlign:"center",color:cell.bold?"#22C55E":"#94A3B8",fontWeight:cell.bold?900:400,fontSize:cell.bold?13:12}}>{cell.value??""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}


        {/* ── Play-by-Play (MLB pitch-by-pitch · NBA/NHL live) ── */}
        {(sport==="mlb"||sport==="nba"||sport==="nhl")&&(g.started||g.completed)&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            {/* Header */}
            <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[["pbp",sport==="mlb"?"⚾ At-Bats":sport==="nhl"?"🏒 All Plays":"🏀 All Plays"],
                  ["scoring",sport==="mlb"?"🏃 Scoring":"🥅 Goals / Scores"]
                ].map(([t,l])=>(
                  <button key={t} onClick={()=>setPbpTab(t)}
                    style={{padding:"5px 12px",borderRadius:14,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
                      border:`1px solid ${pbpTab===t?"rgba(34,197,94,.45)":"rgba(255,255,255,.1)"}`,
                      background:pbpTab===t?"rgba(34,197,94,.1)":"rgba(255,255,255,.03)",
                      color:pbpTab===t?"#22C55E":"#64748B"}}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {!g.completed&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}><div style={{width:5,height:5,borderRadius:"50%",background:"#22C55E",animation:"twinkle .9s ease-in-out infinite alternate"}}/>LIVE</div>}
                <button onClick={loadPbp} style={{padding:"3px 9px",borderRadius:7,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",fontSize:10,cursor:"pointer"}}>↻</button>
              </div>
            </div>

            {/* Inning/Period navigation */}
            {pbpPeriods.length>1&&(
              <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
                <button onClick={()=>setPbpInning(null)}
                  style={{padding:"4px 10px",borderRadius:12,cursor:"pointer",fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,
                    border:`1px solid ${pbpInning===null?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,
                    background:pbpInning===null?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",
                    color:pbpInning===null?"#00D4FF":"#475569"}}>
                  All
                </button>
                {pbpPeriods.map(p=>(
                  <button key={p} onClick={()=>setPbpInning(p)}
                    style={{padding:"4px 10px",borderRadius:12,cursor:"pointer",fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,
                      border:`1px solid ${pbpInning===p?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,
                      background:pbpInning===p?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",
                      color:pbpInning===p?"#00D4FF":"#475569"}}>
                    {sport==="mlb"?`Inn ${p}`:sport==="nba"?`Q${p}`:`P${p}`}
                  </button>
                ))}
              </div>
            )}

            {pbpLoading&&pbp.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading...</div>}
            {!pbpLoading&&pbp.length===0&&<div style={{textAlign:"center",padding:"14px 0",color:"#334155",fontSize:12}}>No play-by-play data available for this game</div>}
            {!pbpLoading&&pbp.length>0&&pbpFiltered.length===0&&<div style={{textAlign:"center",padding:"14px 0",color:"#334155",fontSize:12}}>No {pbpTab==="scoring"?"scoring plays":"plays"} in this {sport==="mlb"?"inning":"period"}</div>}

            {/* MLB: pitch-by-pitch at-bat view */}
            {sport==="mlb"&&pbpFiltered.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:520,overflowY:"auto"}}>
                {pbpFiltered.map((ab,i)=>{
                  const isScore=ab.isScoring;
                  const isCurrent=i===0&&!g.completed&&!ab.isComplete;
                  const fullAb=rawAtBats.find(r=>r.id===ab.id);
                  const pitches=fullAb?.pitches||[];
                  return(
                    <div key={ab.id||i} style={{
                      borderRadius:10,border:`1px solid ${isCurrent?"rgba(0,212,255,.3)":isScore?"rgba(34,197,94,.2)":"rgba(255,255,255,.07)"}`,
                      background:isCurrent?"rgba(0,212,255,.04)":isScore?"rgba(34,197,94,.04)":"rgba(255,255,255,.02)",
                      overflow:"hidden",
                    }}>
                      {/* At-bat header */}
                      <div style={{display:"flex",gap:8,padding:"8px 12px",alignItems:"center",borderBottom:pitches.length?"1px solid rgba(255,255,255,.05)":"none"}}>
                        <div style={{minWidth:38,flexShrink:0}}>
                          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isCurrent?"#00D4FF":isScore?"#22C55E":"#475569",fontWeight:700}}>{ab.inning}</div>
                          {ab.outs!==null&&<div style={{fontSize:8,color:"#334155"}}>{ab.outs} out{ab.outs!==1?"s":""}</div>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:1}}>
                            <span style={{fontSize:11,fontWeight:700,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif"}}>{ab.batter}</span>
                            {ab.pitcher&&<span style={{fontSize:9,color:"#475569"}}>vs {ab.pitcher}</span>}
                          </div>
                          {ab.event&&<div style={{fontSize:10,color:isScore?"#22C55E":"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{ab.event}{ab.rbi>0?` · ${ab.rbi} RBI`:""}</div>}
                          {ab.desc&&<div style={{fontSize:10,color:"#64748B",lineHeight:1.3,marginTop:1}}>{ab.desc}</div>}
                        </div>
                        {isCurrent&&<div style={{fontSize:8,color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,animation:"twinkle .9s ease-in-out infinite alternate"}}>LIVE</div>}
                      </div>

                      {/* Pitches row */}
                      {pitches.length>0&&(
                        <div style={{padding:"8px 12px",display:"flex",gap:6,alignItems:"flex-start",flexWrap:"wrap"}}>
                          {/* Strike zone diagram */}
                          <div style={{position:"relative",width:80,height:90,flexShrink:0}}>
                            {/* Zone box */}
                            <div style={{position:"absolute",left:14,top:8,width:52,height:65,border:"1px solid rgba(255,255,255,.2)",borderRadius:2,
                              background:"rgba(255,255,255,.02)"}}>
                              {/* 9-zone grid lines */}
                              <div style={{position:"absolute",top:"33%",left:0,right:0,height:1,background:"rgba(255,255,255,.1)"}}/>
                              <div style={{position:"absolute",top:"66%",left:0,right:0,height:1,background:"rgba(255,255,255,.1)"}}/>
                              <div style={{position:"absolute",left:"33%",top:0,bottom:0,width:1,background:"rgba(255,255,255,.1)"}}/>
                              <div style={{position:"absolute",left:"66%",top:0,bottom:0,width:1,background:"rgba(255,255,255,.1)"}}/>
                            </div>
                            {/* Plot each pitch */}
                            {pitches.map((p,pi)=>{
                              if(p.px===null||p.pz===null)return null;
                              // px: -0.83 to 0.83 (plate width), map to 14-66px
                              // pz: szBot to szTop, map to 73-8px (inverted)
                              const xPct=(p.px+0.85)/(1.7);
                              const yPct=1-(p.pz-p.szBot)/(p.szTop-p.szBot);
                              const x=14+xPct*52;
                              const y=8+Math.min(Math.max(yPct,0),1)*65;
                              const col=pitchColor(p.callCode||p.call);
                              const isLast=pi===pitches.length-1;
                              return(
                                <div key={pi} title={`${p.type} ${p.velocity?p.velocity+"mph":""} — ${p.call}`}
                                  style={{position:"absolute",width:isLast?10:8,height:isLast?10:8,borderRadius:"50%",
                                    background:col,left:x-4,top:y-4,
                                    border:isLast?"2px solid rgba(255,255,255,.8)":"1px solid rgba(0,0,0,.4)",
                                    fontSize:6,display:"flex",alignItems:"center",justifyContent:"center",
                                    color:"rgba(0,0,0,.7)",fontWeight:900,zIndex:pi+1,
                                    boxShadow:isLast?`0 0 6px ${col}`:undefined}}>
                                  {pi+1}
                                </div>
                              );
                            })}
                          </div>

                          {/* Pitch list */}
                          <div style={{flex:1,display:"flex",flexDirection:"column",gap:3,minWidth:0}}>
                            {pitches.map((p,pi)=>{
                              const col=pitchColor(p.callCode||p.call);
                              const isInPlay=p.isInPlay;
                              return(
                                <div key={pi} style={{display:"flex",gap:5,alignItems:"center",fontSize:10,padding:"2px 0",
                                  borderBottom:pi<pitches.length-1?"1px solid rgba(255,255,255,.04)":"none"}}>
                                  <div style={{width:14,height:14,borderRadius:"50%",background:col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"rgba(0,0,0,.7)",flexShrink:0}}>{pi+1}</div>
                                  <div style={{minWidth:70,fontSize:9,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.type||"Pitch"}</div>
                                  <div style={{fontSize:9,fontWeight:700,color:col,minWidth:50,fontFamily:"'Orbitron',sans-serif"}}>{p.call?.split("(")?.[0]?.trim()||""}</div>
                                  {p.velocity&&<div style={{fontSize:9,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",flexShrink:0}}>{p.velocity}mph</div>}
                                  {isInPlay&&p.exitVelo&&<div style={{fontSize:9,color:"#22C55E",flexShrink:0}}>{p.exitVelo}mph EV</div>}
                                  {isInPlay&&p.hitDist&&<div style={{fontSize:9,color:"#22C55E",flexShrink:0}}>{p.hitDist}ft</div>}
                                  {isInPlay&&p.hitAngle!=null&&<div style={{fontSize:9,color:"#22C55E",flexShrink:0}}>{p.hitAngle}° LA</div>}
                                  <div style={{fontSize:8,color:"#334155",marginLeft:"auto",flexShrink:0}}>{p.balls}-{p.strikes}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* NBA PBP */}
            {sport==="nba"&&pbpFiltered.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:460,overflowY:"auto"}}>
                {pbpFiltered.map((play,i)=>{
                  const isCurrent=i===0&&!g.completed;
                  const isScore=play.isScoring;
                  const score=play.awayScore!=null?`${play.awayScore}–${play.homeScore}`:"";
                  return(
                    <div key={i} style={{display:"flex",gap:10,padding:"7px 10px",borderRadius:7,
                      background:isCurrent?"rgba(59,130,246,.07)":isScore?"rgba(34,197,94,.05)":"rgba(255,255,255,.02)",
                      border:`1px solid ${isCurrent?"rgba(59,130,246,.25)":isScore?"rgba(34,197,94,.15)":"rgba(255,255,255,.05)"}`,
                      alignItems:"center"}}>
                      <div style={{minWidth:46,flexShrink:0}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isCurrent?"#3B82F6":"#475569",fontWeight:700}}>{play.period}</div>
                        <div style={{fontSize:8,color:"#334155"}}>{play.clock}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {play.team&&<span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",fontWeight:700,marginRight:5}}>{play.team}</span>}
                        {isScore&&play.type&&<span style={{fontSize:9,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",marginRight:5}}>{play.type}</span>}
                        <span style={{fontSize:11,color:isScore?"#E2E8F0":"#64748B",lineHeight:1.3}}>{play.desc}</span>
                      </div>
                      {score&&<div style={{fontSize:12,fontWeight:900,color:isScore?"#22C55E":"#475569",flexShrink:0,fontFamily:"'Orbitron',sans-serif"}}>{score}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* NHL PBP */}
            {sport==="nhl"&&pbpFiltered.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:460,overflowY:"auto"}}>
                {pbpFiltered.map((play,i)=>{
                  const isCurrent=i===0&&!g.completed;
                  const isScore=play.isScoring;
                  const score=play.awayScore!=null?`${play.awayScore}–${play.homeScore}`:"";
                  return(
                    <div key={i} style={{display:"flex",gap:10,padding:"7px 10px",borderRadius:7,
                      background:isScore?"rgba(34,197,94,.07)":"rgba(255,255,255,.02)",
                      border:`1px solid ${isScore?"rgba(34,197,94,.25)":"rgba(255,255,255,.06)"}`,
                      alignItems:"center"}}>
                      <div style={{minWidth:46,flexShrink:0}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isScore?"#22C55E":"#475569",fontWeight:700}}>{play.period}</div>
                        <div style={{fontSize:8,color:"#334155"}}>{play.clock}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {play.team&&<span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isScore?"#F59E0B":"#64748B",fontWeight:isScore?700:400,marginRight:5}}>{play.team}</span>}
                        <span style={{fontSize:11,color:isScore?"#E2E8F0":"#64748B",lineHeight:1.3}}>{play.desc}</span>
                      </div>
                      {score&&isScore&&<div style={{fontSize:13,fontWeight:900,color:"#22C55E",flexShrink:0,fontFamily:"'Orbitron',sans-serif"}}>{score}</div>}
                      {isScore&&<div style={{fontSize:8,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0}}>GOAL</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}


        {(g.started||g.completed)&&g.scoringPlays?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#22C55E">{g.sport==="mlb"?"⚾ SCORING PLAYS":g.sport==="nba"?"🏀 SCORING SUMMARY":g.sport==="nhl"?"🏒 GOALS":"🏈 SCORING SUMMARY"}</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {g.scoringPlays.map((sp,i)=>{
                // scoringPlays are pre-normalized: {period, clock, team, desc, awayScore, homeScore, type}
                const score=sp.awayScore!=null?`${sp.awayScore}–${sp.homeScore}`:"";
                return(
                  <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:8,background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.12)",alignItems:"flex-start"}}>
                    <div style={{minWidth:52,flexShrink:0}}>
                      {sp.period&&<div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",fontWeight:700}}>{sp.period}</div>}
                      {sp.clock&&<div style={{fontSize:9,color:"#475569"}}>{sp.clock}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      {sp.team&&<span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",marginRight:8,fontWeight:700}}>{sp.team}</span>}
                      {sp.type&&<span style={{fontSize:9,color:"#F59E0B",marginRight:6,fontFamily:"'Orbitron',sans-serif"}}>{sp.type}</span>}
                      <span style={{fontSize:12,color:"#94A3B8",lineHeight:1.4}}>{sp.desc}</span>
                    </div>
                    {score&&<div style={{fontSize:13,fontWeight:900,color:"#22C55E",flexShrink:0,fontFamily:"'Orbitron',sans-serif",letterSpacing:".04em"}}>{score}</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Team stats — all sports */}
        {g.boxTeams?.length>0&&(()=>{
          const awayT=g.boxTeams.find(t=>t.homeAway==="away")||g.boxTeams[0];
          const homeT=g.boxTeams.find(t=>t.homeAway==="home")||g.boxTeams[1];
          const aStats=awayT?.statistics||[];const hStats=homeT?.statistics||[];
          if(!aStats.length&&!hStats.length)return null;
          return(
            <Card style={{padding:"16px 18px"}} hover={false}>
              <SLabel color="#8B5CF6">📋 TEAM STATS</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,marginBottom:8,alignItems:"center"}}>
                <div style={{textAlign:"center",fontSize:11,fontFamily:"'Orbitron',sans-serif",color:"#64748B",fontWeight:700}}>{g.away.abbr}</div>
                <div/>
                <div style={{textAlign:"center",fontSize:11,fontFamily:"'Orbitron',sans-serif",color:"#64748B",fontWeight:700}}>{g.home.abbr}</div>
              </div>
              {aStats.slice(0,15).map((stat,i)=>{
                const hStat=hStats.find(s=>s.name===stat.name);
                return<StatRow key={i} l={stat.label||stat.name} av={stat.displayValue||stat.value} hv={hStat?.displayValue||hStat?.value}/>;
              })}
            </Card>
          );
        })()}

        {/* NFL Drives */}
        {g.sport==="nfl"&&g.drives?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#F59E0B">🏈 DRIVE SUMMARY</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {g.drives.slice(0,20).map((dr,i)=>(
                <div key={i} style={{padding:"8px 12px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:11,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",fontWeight:700}}>{dr.team?.abbreviation||""}</span>
                    <span style={{fontSize:11,color:dr.result==="TD"?"#22C55E":dr.result==="FG"?"#F59E0B":"#475569",fontWeight:700}}>{dr.result||"—"}</span>
                  </div>
                  <div style={{fontSize:11,color:"#64748B"}}>{dr.description||""}</div>
                  <div style={{fontSize:10,color:"#334155",marginTop:2}}>{dr.plays?.length||0} plays · {dr.yards||0} yds</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Player box scores — all sports */}
        {g.boxPlayers?.length>0&&g.boxPlayers.map((side,si)=>{
          const categories=side.statistics||[];if(!categories.length)return null;
          const teamAbbr=side.team?.abbreviation||`Team ${si+1}`;
          const teamName=side.team?.displayName||teamAbbr;
          // Sport-specific category names
          const sportCatNames={
            mlb:["BATTING","PITCHING","FIELDING"],
            nba:["STARTERS","BENCH"],
            nfl:["PASSING","RUSHING","RECEIVING","DEFENSE","KICKING"],
            nhl:["SKATERS","GOALIES"],
          }[g.sport]||[];
          // Key highlight stats per sport for quick-scan row
          const highlightStat=(stats,labels,sport)=>{
            if(sport==="nba"){const pts=stats[labels.indexOf("PTS")]||stats[0];const reb=stats[labels.indexOf("REB")]||stats[4];const ast=stats[labels.indexOf("AST")]||stats[5];return[pts,reb,ast].filter(Boolean).join(" / ");}
            if(sport==="nhl"){const g2=stats[labels.indexOf("G")]??stats[0];const a=stats[labels.indexOf("A")]??stats[1];return`${g2}G ${a}A`;}
            return null;
          };
          return(
            <Card key={si} style={{padding:"16px 18px",marginBottom:12}} hover={false}>
              <SLabel color={g.sport==="nba"?"#F59E0B":g.sport==="nhl"?"#00D4FF":"#22C55E"}>
                {g.sport==="nba"?"🏀":g.sport==="nhl"?"🏒":g.sport==="mlb"?"⚾":"🏈"} {teamName.toUpperCase()} — PLAYER STATS
              </SLabel>
              {categories.map((cat,ci)=>{
                const players=cat.athletes||[];if(!players.length)return null;
                const labels=(cat.labels||cat.keys||[]);
                const totals=cat.totals||[];
                const catName=sportCatNames[ci]||cat.name||`CAT ${ci+1}`;
                return(
                  <div key={ci} style={{marginBottom:ci<categories.length-1?18:0}}>
                    <div style={{fontSize:9,color:"#475569",marginBottom:8,fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,.05)"}}>{catName}</div>
                    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:Math.max(360,labels.length*52+140)}}>
                        <thead>
                          <tr style={{borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                            <td style={{padding:"5px 8px",color:"#475569",minWidth:130,fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>PLAYER</td>
                            {labels.map((l,li)=>(
                              <td key={li} style={{padding:"5px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>{l}</td>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {players.filter(Boolean).map((p,pi)=>{
                            const stats=p.stats||[];
                            const name=p.athlete?.shortName||p.athlete?.displayName||"—";
                            const pos=p.athlete?.position?.abbreviation||"";
                            const isStarter=p.starter||p.status?.displayValue==="Starter"||false;
                            // Highlight top performers
                            const pts=g.sport==="nba"?parseInt(stats[labels.indexOf("PTS")]||0):0;
                            const goals=g.sport==="nhl"?parseInt(stats[labels.indexOf("G")]??0):0;
                            const isTop=(g.sport==="nba"&&pts>=20)||(g.sport==="nhl"&&goals>=1);
                            return(
                              <tr key={pi} style={{
                                background:isTop?"rgba(245,158,11,.04)":pi%2===0?"rgba(255,255,255,.02)":"transparent",
                                borderBottom:"1px solid rgba(255,255,255,.04)",
                              }}>
                                <td style={{padding:"6px 8px",whiteSpace:"nowrap"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    {pos&&<span style={{fontSize:8,fontFamily:"'Orbitron',sans-serif",color:"#334155",minWidth:20}}>{pos}</span>}
                                    <span style={{color:isTop?"#F59E0B":"#E2E8F0",fontWeight:isTop?700:500,fontSize:11}}>{name}</span>
                                    {isStarter&&<span style={{fontSize:7,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>S</span>}
                                  </div>
                                </td>
                                {stats.map((s,si2)=>{
                                  const lbl=labels[si2]||"";
                                  // Color-code key stats
                                  const isKeyNBA=["PTS","REB","AST","STL","BLK"].includes(lbl);
                                  const isKeyNHL=["G","A","PTS","+/-"].includes(lbl);
                                  const isKey=isKeyNBA||isKeyNHL;
                                  const val=s||"—";
                                  const isZero=val==="0"||val==="0.0"||val==="—";
                                  return(
                                    <td key={si2} style={{
                                      padding:"6px 6px",textAlign:"center",
                                      color:isKey&&!isZero?"#E2E8F0":"#64748B",
                                      fontWeight:isKey&&!isZero?700:400,
                                      fontSize:isKey?12:11,
                                      fontFamily:isKey?"'Orbitron',sans-serif":"'Rajdhani',sans-serif",
                                    }}>{val}</td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                          {/* Totals row */}
                          {totals.length>0&&(
                            <tr style={{borderTop:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)"}}>
                              <td style={{padding:"5px 8px",fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>TOTALS</td>
                              {totals.map((t,ti)=><td key={ti} style={{padding:"5px 6px",textAlign:"center",color:"#94A3B8",fontSize:11,fontWeight:700}}>{t||"—"}</td>)}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </Card>
          );
        })}

        {/* Injuries */}
        {g.injuries?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#EF4444">🚑 INJURY REPORT</SLabel>
            {g.injuries.slice(0,12).map((inj,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:12,color:"#94A3B8"}}>{inj.athlete?.displayName||inj.displayName||"—"} <span style={{color:"#475569",fontSize:10}}>({inj.team?.abbreviation||""})</span></span>
                <span style={{fontSize:12,fontWeight:600,color:"#EF4444"}}>{inj.status||inj.type||"—"}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── GM Mode — Sports GM Simulation ─────────────────────────────────────────
// Full sports GM game: roster management, trades, draft, season simulation
// Uses Claude AI for trade evaluation, simulation, and draft grading

// ─── GM Mode v2 — Step-by-Step Offseason Planner ────────────────────────────
// Gemini free tier: 15 req/min, 1500/day — queue calls to avoid 429
const _aiQueue={queue:[],running:0,maxConcurrent:1};
function _aiEnqueue(fn){return new Promise((res,rej)=>{_aiQueue.queue.push({fn,res,rej});_aiDrain();});}
async function _aiDrain(){
  if(_aiQueue.running>=_aiQueue.maxConcurrent||!_aiQueue.queue.length)return;
  _aiQueue.running++;
  const{fn,res,rej}=_aiQueue.queue.shift();
  try{res(await fn());}catch(e){rej(e);}finally{_aiQueue.running--;setTimeout(_aiDrain,800);} // 800ms gap between calls
}
async function aiCall(prompt,sys="You are an expert sports analyst. Return only valid JSON.",maxTok=2000){
  return _aiEnqueue(async()=>{
    for(let attempt=0;attempt<4;attempt++){
      try{
        const r=await fetch("/api/hyperbeam?gm_ai=1",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({prompt,system:sys,max_tokens:maxTok}),
        });
        if(!r.ok)throw new Error(`Proxy ${r.status}`);
        const d=await r.json();
        if(d.error&&d.error.includes("429")){
          // Rate limited — wait and retry
          const wait=[5000,15000,30000][attempt]||30000;
          console.warn(`Gemini 429 — retrying in ${wait/1000}s (attempt ${attempt+1})`);
          await new Promise(r=>setTimeout(r,wait));
          continue;
        }
        if(d.error){console.warn("aiCall:",d.error);return{error:d.error};}
        let t=d.text||"{}";
        t=t.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```\s*$/,"").trim();
        if(!t.startsWith("[")&&!t.startsWith("{")){const m=t.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);if(m)t=m[1];}
        return JSON.parse(t);
      }catch(e){
        if(attempt<3){await new Promise(r=>setTimeout(r,3000*(attempt+1)));continue;}
        console.error("aiCall failed:",e.message);return{error:String(e)};
      }
    }
    return{error:"Max retries exceeded"};
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────
const GM_SPORTS=[
  {id:"mlb",label:"MLB",icon:"⚾",color:"#22C55E",espnPath:"baseball/mlb"},
  {id:"nfl",label:"NFL",icon:"🏈",color:"#EF4444",espnPath:"football/nfl"},
  {id:"nba",label:"NBA",icon:"🏀",color:"#F59E0B",espnPath:"basketball/nba"},
  {id:"nhl",label:"NHL",icon:"🏒",color:"#00D4FF",espnPath:"hockey/nhl"},
];
const CAP_TABLE={mlb:{cap:240,luxury:237},nfl:{cap:255,luxury:280},nba:{cap:136,luxury:165},nhl:{cap:88,luxury:99}};
const ROSTER_RULES={
  mlb:{active:26,max:40,il10:true,il60:true,waivers:true,rule5:true,pickTrade:false},
  nfl:{active:53,max:53,il10:false,il60:false,waivers:true,rule5:false,pickTrade:true},
  nba:{active:15,max:15,il10:true,il60:false,waivers:true,rule5:false,pickTrade:true},
  nhl:{active:23,max:23,il10:false,il60:false,waivers:true,rule5:false,pickTrade:true},
};
const GAMES={mlb:162,nfl:17,nba:82,nhl:82};
const AWARDS={mlb:["MVP","Cy Young","Rookie of Year","Gold Glove","All-Star"],nfl:["MVP","OPOY","DPOY","OROY","All-Pro","Pro Bowl"],nba:["MVP","DPOY","ROY","MIP","Sixth Man","All-NBA","All-Star"],nhl:["Hart Trophy","Norris","Vezina","Calder","All-Star"]};
const GM_POSITIONS={mlb:["SP","RP","C","1B","2B","3B","SS","LF","CF","RF","DH"],nfl:["QB","RB","WR","TE","OT","G","C","DE","DT","LB","CB","S","K"],nba:["PG","SG","SF","PF","C"],nhl:["C","LW","RW","D","G"]};
const DEPTH_SLOTS={mlb:["SP1","SP2","SP3","SP4","SP5","CL","SU1","SU2","C","1B","2B","3B","SS","LF","CF","RF","DH","BN1","BN2"],nfl:["QB","RB1","RB2","WR1","WR2","WR3","TE","OT","G","C","DE1","DE2","DT","LB1","LB2","CB1","CB2","S1","S2","K"],nba:["PG","SG","SF","PF","C","6th","Bench1","Bench2","Bench3","Bench4"],nhl:["C1","LW1","RW1","C2","LW2","RW2","C3","LW3","RW3","D1","D2","D3","D4","G1","G2"]};
const SCHEMES={nfl:["4-3","3-4","4-2-5 Nickel","3-3-5","2-4-5 Dime"],mlb:["Power","Small Ball","Pitching First","Analytics","Speed"],nba:["Run & Gun","Defensive Grind","Iso Heavy","Motion Offense","Twin Towers"],nhl:["Trap","Offensive Zone","Physical","Speed Based","Balanced"]};
const GM_STEPS=[{id:"trim",n:1,label:"Trim the Fat",icon:"✂️",desc:"Cut & waive players"},{id:"cap",n:2,label:"Cap Gymnastics",icon:"💰",desc:"Restructure & extend"},{id:"trades",n:3,label:"Trade Block",icon:"🔄",desc:"Field & make offers"},{id:"fa",n:4,label:"Free Agency",icon:"🖊",desc:"Sign your guys"},{id:"draft",n:5,label:"Mock Draft",icon:"🎓",desc:"Draft real prospects"},{id:"command",n:6,label:"Command Center",icon:"⚙️",desc:"Depth chart & roster"},{id:"review",n:7,label:"Review",icon:"🏆",desc:"Grade & simulate"}];

// ── Player utilities ──────────────────────────────────────────────────────────
function enrichPlayer(p,sport){
  const age=p.age||25,ovr=p.ovr||70;
  return{...p,
    potential:p.potential||Math.min(99,ovr+(age<=21?Math.floor(Math.random()*25)+10:age<=24?Math.floor(Math.random()*15)+4:age<=27?Math.floor(Math.random()*8)+2:Math.floor(Math.random()*4))),
    traits:p.traits||[],
    contractType:p.contractType||"standard",
    options:p.options||null,
    noTradeClause:p.noTradeClause||false,
    on40man:p.on40man!==undefined?p.on40man:true,
    il:p.il||null,
    serviceTime:p.serviceTime||Math.max(0,age-22),
    injuryHistory:p.injuryHistory||[],
    devSpeed:p.devSpeed||(age<24?"fast":age<28?"normal":"slow"),
    awardsWon:p.awardsWon||[],
    seasonStats:p.seasonStats||{},
    careerStats:p.careerStats||{},
  };
}

function progressPlayer(p,simResult,yr){
  const newAge=p.age+1;
  let ovrDelta=0;
  if(newAge<=25)ovrDelta=p.devSpeed==="fast"?Math.floor(Math.random()*4)+1:Math.floor(Math.random()*3);
  else if(newAge<=28)ovrDelta=Math.floor(Math.random()*3)-1;
  else if(newAge<=32)ovrDelta=-(Math.floor(Math.random()*2)+1);
  else if(newAge<=35)ovrDelta=-(Math.floor(Math.random()*2)+2);
  else ovrDelta=-(Math.floor(Math.random()*3)+2);
  const perf=simResult?.playerStats?.find(s=>s.name===p.name);
  if(perf&&ovrDelta<0&&(perf.grade==="A"||perf.grade==="A+"))ovrDelta+=1;
  const newOvr=Math.max(45,Math.min(p.potential||99,p.ovr+ovrDelta));
  return{...p,age:newAge,ovr:newOvr,years:Math.max(0,p.years-1),serviceTime:(p.serviceTime||0)+1,lastProgression:ovrDelta,il:null,injuryHistory:p.il?[...(p.injuryHistory||[]),{year:yr,type:p.il==="60"?"60-day IL":"10-day IL"}]:(p.injuryHistory||[]),status:p.years<=1?"expired":p.il?"active":p.status};
}

function playerTradeValue(p,sport){
  const capT=CAP_TABLE[sport]||{cap:200};
  let v=(p.ovr||70)*0.8;
  const age=p.age||28;
  if(age<=25)v*=1.2+((p.potential||p.ovr||70)-(p.ovr||70))*0.015;
  else if(age<=29)v*=1.1;
  else if(age<=32)v*=0.92;
  else v*=Math.max(0.5,1-(age-32)*0.08);
  const marketSal=(((p.ovr||70)/99)*capT.cap*0.18);
  v*=Math.min(1.5,marketSal/Math.max(1,p.salary||5));
  if((p.injuryHistory?.length||0)>2)v*=0.85;
  if(p.noTradeClause)v*=0.9;
  return Math.round(Math.max(10,v));
}

function calcCap(roster,sport){
  const ct=CAP_TABLE[sport]||{cap:200,luxury:220};
  const used=roster.filter(Boolean).reduce((s,p)=>s+(p.il==="60"?p.salary*0.5:p.salary||0),0);
  return{used:parseFloat(used.toFixed(2)),total:ct.cap,space:parseFloat((ct.cap-used).toFixed(2)),luxury:used>ct.luxury,luxuryAmt:Math.max(0,used-ct.luxury),pct:(used/ct.cap)*100};
}

function generateInjuries(roster,sport,gamesTotal){
  const rates={mlb:0.4,nfl:0.75,nba:0.3,nhl:0.5};
  const typesBySport={
    mlb:[{t:"Hamstring strain",il:"10",g:10},{t:"Oblique strain",il:"10",g:15},{t:"UCL",il:"60",g:60},{t:"Shoulder inflammation",il:"10",g:18},{t:"Wrist contusion",il:"10",g:12},{t:"Knee sprain",il:"60",g:45}],
    nfl:[{t:"Hamstring",g:2},{t:"Concussion",g:1},{t:"ACL tear",g:17},{t:"High ankle sprain",g:4},{t:"Shoulder",g:3}],
    nba:[{t:"Hamstring strain",g:10},{t:"Ankle sprain",g:6},{t:"Back tightness",g:8},{t:"Knee soreness",g:12},{t:"Finger fracture",g:5}],
    nhl:[{t:"Upper body",g:6},{t:"Lower body",g:8},{t:"Concussion",g:3},{t:"Shoulder",g:10}],
  };
  const types=typesBySport[sport]||typesBySport.nba;
  const injuries=[];
  roster.filter(p=>p.status==="active").forEach(p=>{
    const factor=(p.age>32?1.4:p.age>28?1.1:0.9)*((p.injuryHistory?.length||0)>2?1.3:1);
    if(Math.random()<(rates[sport]||0.4)*factor*0.25){
      const inj=types[Math.floor(Math.random()*types.length)];
      injuries.push({name:p.name,pos:p.pos,type:inj.t,games_missed:inj.g,il:inj.il||null,severity:inj.g>30?"Season-ending":inj.g>14?"Significant":"Minor",game:Math.floor(Math.random()*gamesTotal)+1});
    }
  });
  return injuries;
}

// ── OVR badge ─────────────────────────────────────────────────────────────────
function OVRBadge({ovr}){
  const col=!ovr?"#64748B":ovr>=93?"#A855F7":ovr>=87?"#22C55E":ovr>=80?"#3B82F6":ovr>=73?"#F59E0B":"#64748B";
  return<div style={{minWidth:34,textAlign:"center",padding:"3px 6px",borderRadius:7,background:col+"20",border:`1px solid ${col}44`}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:col}}>{ovr||"?"}</div></div>;
}

function GradeChip({grade}){
  const col=!grade?"#475569":grade.startsWith("A")?"#22C55E":grade.startsWith("B")?"#F59E0B":grade.startsWith("C")?"#FB923C":"#EF4444";
  return<div style={{padding:"2px 8px",borderRadius:10,background:col+"20",border:`1px solid ${col}44`,fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:col}}>{grade||"?"}</div>;
}

function CapBar({used,total,ac}){
  const pct=Math.min(100,(used/total)*100);
  const col=pct>95?"#EF4444":pct>82?"#F59E0B":ac;
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#475569",marginBottom:3}}>
      <span style={{fontFamily:"'Orbitron',sans-serif"}}>${used.toFixed(1)}M used</span>
      <span style={{color:col}}>${(total-used).toFixed(1)}M space{pct>95?" ⚠️ OVER":pct>82?" ⚠️ TIGHT":""}</span>
    </div>
    <div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:3}}>
      <div style={{height:"100%",borderRadius:3,background:col,width:`${pct}%`,transition:"width .3s"}}/>
    </div>
  </div>);
}

// ── Main GMGame component ─────────────────────────────────────────────────────
function GMGame({cu}){
  const mob=useIsMobile();
  const[phase,setPhase]=useState("setup");
  const[step,setStep]=useState("trim");
  const[sport,setSport]=useState(null);
  const[teams,setTeams]=useState([]);
  const[myTeam,setMyTeam]=useState(null);
  const[year,setYear]=useState(2025);
  const[season,setSeason]=useState(1); // franchise season #
  const[roster,setRoster]=useState([]); // active + IL roster
  const[roster40,setRoster40]=useState([]); // 40-man (MLB only)
  const[farmSystem,setFarmSystem]=useState({AAA:[],AA:[],A:[],Rookie:[]});
  const[freeAgents,setFreeAgents]=useState([]);
  const[faAuctions,setFaAuctions]=useState({});
  const[cuts,setCuts]=useState([]);
  const[waived,setWaived]=useState([]);
  const[extensions,setExtensions]=useState({});
  const[tradeBlock,setTradeBlock]=useState([]);
  const[tradeOffers,setTradeOffers]=useState([]);
  const[myTradeOffer,setMyTradeOffer]=useState({myPlayers:[],myPicks:[],theirPlayers:[],theirPicks:[],theirTeam:"",result:null,loading:false,cashRetained:0});
  const[tradeTargets,setTradeTargets]=useState([]);
  const[loadingTargets,setLoadingTargets]=useState(false);
  const[pickInventory,setPickInventory]=useState([]); // my draft picks
  const[draftBoard,setDraftBoard]=useState([]);
  const[myDraftPicks,setMyDraftPicks]=useState([]);
  const[aiDraftOffers,setAiDraftOffers]=useState([]);
  const[undoStack,setUndoStack]=useState([]); // for undo draft picks
  const[depthChart,setDepthChart]=useState({});
  const[scheme,setScheme]=useState("");
  const[budget,setBudget]=useState({payroll:200,scouting:20,development:15,international:10});
  const[ownerGoals,setOwnerGoals]=useState([]);
  const[allMoves,setAllMoves]=useState([]);
  const[simResult,setSimResult]=useState(null);
  const[simHistory,setSimHistory]=useState([]); // past season results
  const[offseasonGrade,setOffseasonGrade]=useState(null);
  const[loading,setLoading]=useState(false);
  const[loadMsg,setLoadMsg]=useState("");
  const[simProgress,setSimProgress]=useState(0);
  const[toast,setToast]=useState(null);
  const[savedState,setSavedState]=useState(null);
  const[cmdOpen,setCmdOpen]=useState(false);
  const[rosterTab,setRosterTab]=useState("active"); // active|40man|farm|il|waived
  const[qaOfferPlayers,setQaOfferPlayers]=useState({}); // QO sent to players
  const[awardWinners,setAwardWinners]=useState(null);
  const[allStarRoster,setAllStarRoster]=useState(null);

  const sc=GM_SPORTS.find(s=>s.id===sport);
  const ac=sc?.color||"#00D4FF";
  const capInfo=calcCap(roster,sport);
  const rules=ROSTER_RULES[sport]||ROSTER_RULES.mlb;

  const showToast=(msg,color="#22C55E")=>{setToast({msg,color});setTimeout(()=>setToast(null),3500);};
  const logMove=(msg)=>setAllMoves(p=>[{msg,ts:Date.now()},...p].slice(0,100));

  // ── Persist ─────────────────────────────────────────────────────────────
  useEffect(()=>{
    try{
      const raw=localStorage.getItem(`gm3_${cu?.id||"g"}`);
      if(raw)setSavedState(JSON.parse(raw));
      // Also try old gm2 save for migration
      else{
        const old=localStorage.getItem(`gm2_${cu?.id||"g"}`);
        if(old)setSavedState({...JSON.parse(old),_migrated:true});
      }
    }catch(e){}
  },[]);

  const save=useCallback((extra={})=>{
    const s={sport,myTeam,year,season,roster,roster40,farmSystem,freeAgents,cuts,waived,tradeBlock,depthChart,scheme,budget,ownerGoals,allMoves,myDraftPicks,draftBoard,simResult,simHistory,offseasonGrade,pickInventory,faAuctions,phase,step,...extra};
    try{localStorage.setItem(`gm3_${cu?.id||"g"}`,JSON.stringify(s));}catch(e){console.warn("Save failed (storage full?):",e);}
  },[sport,myTeam,year,season,roster,roster40,farmSystem,freeAgents,cuts,waived,tradeBlock,depthChart,scheme,budget,ownerGoals,allMoves,myDraftPicks,draftBoard,simResult,simHistory,offseasonGrade,pickInventory,faAuctions,phase,step]);

  const loadSave=()=>{
    if(!savedState)return;
    const s=savedState;
    setSport(s.sport);setMyTeam(s.myTeam);setYear(s.year||2025);setSeason(s.season||1);
    setRoster((s.roster||[]).map(p=>enrichPlayer(p,s.sport)));
    setRoster40(s.roster40||[]);
    setFarmSystem(s.farmSystem||{AAA:[],AA:[],A:[],Rookie:[]});
    setFreeAgents(s.freeAgents||[]);setFaAuctions(s.faAuctions||{});
    setCuts(s.cuts||[]);setWaived(s.waived||[]);
    setTradeBlock(s.tradeBlock||[]);setDepthChart(s.depthChart||{});setScheme(s.scheme||"");
    setBudget(s.budget||{payroll:200,scouting:20,development:15,international:10});
    setOwnerGoals(s.ownerGoals||[]);setAllMoves(s.allMoves||[]);
    setMyDraftPicks(s.myDraftPicks||[]);setDraftBoard(s.draftBoard||[]);
    setSimResult(s.simResult||null);setSimHistory(s.simHistory||[]);
    setOffseasonGrade(s.offseasonGrade||null);setPickInventory(s.pickInventory||[]);
    setPhase(s.phase||"steps");setStep(s.step||"trim");
  };

  // ── Load teams ────────────────────────────────────────────────────────────
  const loadTeams=async(s)=>{
    setLoading(true);setLoadMsg("Loading teams...");
    try{
      const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/${GM_SPORTS.find(x=>x.id===s).espnPath}/teams?limit=60`);
      const d=await r.json();
      const list=(d.sports?.[0]?.leagues?.[0]?.teams||d.teams||[]).map(t=>{
        const team=t.team||t;
        return{id:String(team.id),abbr:team.abbreviation||"",name:team.displayName||team.name||"",logo:team.logos?.[0]?.href||""};
      });
      setTeams(list);
    }catch(e){showToast("Failed to load teams","#EF4444");}
    setLoading(false);setLoadMsg("");
  };

  // ── Load roster (full franchise enrichment) ───────────────────────────────
  const loadRoster=async(team,s)=>{
    setLoading(true);setLoadMsg("Loading roster & contracts...");
    const espnPath=GM_SPORTS.find(x=>x.id===s).espnPath;
    try{
      const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/teams/${team.id}/roster`);
      const d=await r.json();
      const athletes=(d.athletes||[]).flatMap(g=>g.items||g);
      setLoadMsg("Generating realistic contracts & ratings...");
      const playerNames=athletes.slice(0,35).map(a=>a.displayName||a.fullName||"?").join(", ");
      const contractData=await aiCall(
        `Generate realistic ${year} ${s.toUpperCase()} contracts and ratings for these real players: ${playerNames}. Team: ${team.name}. Return JSON array same order: [{salary(M float),years(1-6),ovr(50-99),age,pos,potential(ovr+0to20),contractType("rookie"|"arb"|"standard"|"veteran"|"min"),traits(array of 1-2 strings like "Power Hitter" or "Ace"),noTradeClause(bool),note}]. Be realistic to actual player skill and market value.`,
        "You are an expert sports GM analyst. Return only valid JSON array."
      );
      const contracts=Array.isArray(contractData)?contractData:[];
      const rosterData=athletes.slice(0,35).map((a,i)=>{
        const c=contracts[i]||{};
        const name=a.displayName||a.fullName||"Player";
        const age=c.age||a.age||26;
        const ovr=c.ovr||Math.floor(Math.random()*25)+65;
        return enrichPlayer({
          id:String(a.id||i),name,
          pos:a.position?.abbreviation||c.pos||"?",
          age,ovr,potential:c.potential||Math.min(99,ovr+Math.floor(Math.random()*12)),
          salary:c.salary||parseFloat((Math.random()*12+1).toFixed(2)),
          years:c.years||Math.floor(Math.random()*3)+1,
          contractType:c.contractType||"standard",
          traits:c.traits||[],
          noTradeClause:c.noTradeClause||false,
          note:c.note||"",
          status:"active",on40man:true,
          headshot:a.headshot?.href||`https://a.espncdn.com/i/headshots/${espnPath.split("/")[1]}/players/full/${a.id}.png`,
        },s);
      });
      setRoster(rosterData);
      // Init pick inventory
      setPickInventory(initPickInventory(year,team.name,s));
      // Init depth chart
      const slots=DEPTH_SLOTS[s]||[];
      const chart={};
      slots.forEach((slot,idx)=>{const p=rosterData[idx];chart[slot]=p?p.id:null;});
      setDepthChart(chart);
      setScheme(SCHEMES[s]?.[0]||"");
      // Owner goals based on roster strength
      const teamOvr=Math.round(rosterData.reduce((s,p)=>s+p.ovr,0)/Math.max(1,rosterData.length));
      setOwnerGoals(teamOvr>=82?["Win Championship","Reduce Luxury Tax"]:[teamOvr>=75?["Make Playoffs","Develop Prospects"]:["Rebuild","Cut Payroll","Draft Well"]]);
      setLoadMsg("Scouting free agent market...");
      await loadFAs(s,team,rosterData);
      if(s==="mlb"){setLoadMsg("Building farm system...");await loadFarm(team,s);}
    }catch(e){console.error(e);showToast("Error loading roster","#EF4444");}
    setLoading(false);setLoadMsg("");
  };

  const initPickInventory=(yr,teamName,s)=>{
    if(!ROSTER_RULES[s]?.pickTrade)return[];
    const picks=[];
    [0,1,2].forEach(off=>{
      const y=yr+off;
      [1,2].forEach(round=>{
        picks.push({id:`pick_${teamName.replace(/\s/g,"_")}_${y}_r${round}`,team:teamName,year:y,round,label:`${y} ${round===1?"1st":"2nd"} Rd`,owned:true,traded:false});
      });
    });
    return picks;
  };

  // ── FA Market ─────────────────────────────────────────────────────────────
  const loadFAs=async(s,team,existingRoster)=>{
    const result=await aiCall(
      `Generate 28 realistic ${year} ${s.toUpperCase()} free agents for the open market. Context: ${team.name} is bidding. Include marquee players, solid vets, and bargains. Each player is UNIQUE — no duplicates. Return JSON array: [{name,pos,age,salary(millions ask,float),years(1-5),ovr(55-98),potential(55-99),contractType("veteran"|"standard"|"min"),note,historicalComp,aiTeamInterest(2-3 competing teams),traits(1-2 strings)}]. Mix tiers: 2-3 elite ($20M+), 5-7 solid ($8-15M), 8-10 average ($3-7M), 8-10 bargain (<$3M).`,
      "You are an expert sports GM. Return only valid JSON array."
    );
    if(Array.isArray(result)){
      const fas=result.map((fa,i)=>enrichPlayer({...fa,id:`fa_${i}_${Date.now()}`,status:"fa"},s));
      setFreeAgents(fas);
      const auctions={};
      fas.forEach(fa=>{
        if(fa.aiTeamInterest?.length>0){
          auctions[fa.id]={bidders:fa.aiTeamInterest.map(t=>({team:t,offer:parseFloat((fa.salary*(0.88+Math.random()*0.35)).toFixed(2)),years:fa.years})),stage:"open"};
        }
      });
      setFaAuctions(auctions);
    }
  };

  // ── Farm System ───────────────────────────────────────────────────────────
  const loadFarm=async(team,s)=>{
    setLoadMsg("Loading minor league system...");
    let farm={AAA:[],AA:[],A:[],Rookie:[]};
    if(s==="mlb"){
      try{
        const affRes=await fetch(`https://statsapi.mlb.com/api/v1/teams/${team.id}/affiliates?season=${year}`);
        if(affRes.ok){
          const affData=await affRes.json();
          const levelMap={11:"AAA",12:"AA",13:"A",14:"A",16:"Rookie"};
          const affiliates=affData.affiliates||[];
          await Promise.allSettled(affiliates.slice(0,5).map(async aff=>{
            const lvl=levelMap[aff.sport?.id];
            if(!lvl)return;
            try{
              const rRes=await fetch(`https://statsapi.mlb.com/api/v1/teams/${aff.teamId||aff.id}/roster?season=${year}&rosterType=fullRoster`);
              if(!rRes.ok)return;
              const rData=await rRes.json();
              const players=(rData.roster||[]).slice(0,12).map(p=>enrichPlayer({
                id:String(p.person?.id||Math.random()),
                name:p.person?.fullName||"Prospect",
                pos:p.position?.abbreviation||"?",
                age:p.person?.currentAge||21,
                ovr:Math.floor(Math.random()*18)+50,
                potential:Math.floor(Math.random()*22)+60,
                years:3,salary:0.75,
                eta:lvl==="AAA"?1:lvl==="AA"?2:lvl==="A"?3:4,
                level:lvl,on40man:false,status:"active",
              },s));
              if(players.length>0)farm[lvl]=[...farm[lvl],...players];
            }catch(e){}
          }));
        }
      }catch(e){}
    }
    const hasReal=Object.values(farm).some(a=>a.length>0);
    if(!hasReal){
      setLoadMsg("Generating farm system with AI...");
      const result=await aiCall(
        `Generate a ${year} ${s.toUpperCase()} minor league farm system for ${team.name}. 
${s==="mlb"?"Levels: AAA (10 players), AA (10), A (10), Rookie (8)":"Levels: AAA (10 players), AA (10), A (8)"}
Return JSON: {AAA:[{name,pos,age,ovr(55-72),potential(62-95),eta(1),level:"AAA",traits(1 string)}],AA:[...],A:[...],Rookie:[...]}. 
Use realistic prospect names. AAA=ready to contribute, Rookie=raw talent.`
      );
      if(result?.AAA)farm=result;
    }
    // Enrich farm players
    Object.keys(farm).forEach(lvl=>{farm[lvl]=(farm[lvl]||[]).map(p=>enrichPlayer({...p,level:lvl,on40man:false,status:"active",years:3,salary:0.75},s));});
    setFarmSystem(farm);
  };

  // ── Draft Board ───────────────────────────────────────────────────────────
  const loadDraftBoard=async()=>{
    if(draftBoard.length>0)return;
    setLoading(true);setLoadMsg("Fetching draft prospects...");
    let prospects=[];
    if(sport==="mlb"){
      try{
        setLoadMsg("Fetching MLB draft prospects from MLB.com...");
        const r=await fetch(`https://statsapi.mlb.com/api/v1/draft/prospects?year=${year}&limit=100`);
        if(r.ok){
          const d=await r.json();
          const raw=d.prospects||[];
          if(raw.length>0){
            prospects=raw.slice(0,50).map((p,i)=>({
              name:p.person?.fullName||"Prospect",
              pos:p.primaryPosition?.abbreviation||"?",
              school:p.school?.name||p.homeCity||"",
              age:p.person?.currentAge||18,
              pick:i+1,round:i<10?1:i<25?2:3,
              ovr:Math.max(50,78-Math.floor(i*0.65)),
              potential:Math.max(65,93-Math.floor(i*0.6)),
              floor:Math.max(40,65-Math.floor(i*0.5)),
              grade:i<5?"A+":i<10?"A":i<15?"A-":i<22?"B+":i<30?"B":"B-",
              scoutingReport:`${p.person?.fullName} is a ${p.primaryPosition?.abbreviation} from ${p.school?.name||p.homeCity||"Unknown"}. Ranked #${i+1} overall.`,
              comparable:"TBD",tradeValue:Math.max(1,10-Math.floor(i/4)),
              signability:i<20?"Easy":i<35?"Medium":"Hard",
              eta:i<15?1:i<30?2:3,
            }));
          }
        }
      }catch(e){console.warn("MLB draft API failed:",e);}
    }
    if(prospects.length<5){
      setLoadMsg(`Loading ${year} ${sport?.toUpperCase()} draft class...`);
      const guides={
        mlb:`${year} MLB draft: Top college pitchers from power conferences, toolsy HS bats. Real-sounding names.`,
        nfl:`${year} NFL draft: players completing eligibility after ${year-1} season. Top QBs, pass rushers, WRs. Real school names.`,
        nba:`${year} NBA draft: International prospects + US college players. Mix of stars and depth.`,
        nhl:`${year} NHL draft: CHL juniors, European leagues. Mostly 18-year-olds.`,
      };
      const result=await aiCall(
        `Create the ${year} ${sport?.toUpperCase()} draft class with 50 prospects. ${guides[sport]||""}
Return JSON array ordered by rank: [{name,pos,school,age,ovr(48-78),potential(65-99),floor(35-70),round(1-3),pick(1-50),scoutingReport(2 sentences),grade("A+"to"C"),comparable,tradeValue(1-10),signability("Easy"|"Medium"|"Hard"),eta(1-4 years)}]`,
        `You are a pro ${sport?.toUpperCase()} draft scout. Realistic names and ratings. Return only valid JSON array.`
      );
      if(Array.isArray(result))prospects=result;
    }
    if(prospects.length>0){
      setDraftBoard(prospects);
      const pickTrade=ROSTER_RULES[sport]?.pickTrade;
      if(pickTrade){
        const offers=await aiCall(`Generate 3 AI teams wanting to trade up in the ${year} ${sport?.toUpperCase()} draft. User is GM of ${myTeam?.name}. Return JSON array: [{fromTeam,offeredPick,askingPick,plusPlayer,analysis}]`);
        if(Array.isArray(offers))setAiDraftOffers(offers);
      }
      showToast(`${prospects.length} draft prospects loaded ✅`);
    }else showToast("Draft board failed — try again","#F59E0B");
    setLoading(false);setLoadMsg("");
  };

  // ── Trade offers (incoming) ───────────────────────────────────────────────
  const loadTradeOffers=async()=>{
    if(tradeOffers.length>0)return;
    setLoading(true);setLoadMsg("Fielding league trade offers...");
    const topPlayers=roster.filter(p=>p.ovr>=75).slice(0,6).map(p=>`${p.name}(${p.pos},OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.noTradeClause?"NTC":""}`).join(", ");
    const result=await aiCall(
      `Generate 5 realistic incoming trade offers for ${myTeam?.name} in ${year} ${sport?.toUpperCase()}. Their best players: ${topPlayers}. 
Consider team's rebuild vs contend status. Mix of stars wanted, depth trades, and package deals. 
Return JSON array: [{fromTeam,teamNeeds("rebuild"|"contend"),theyWant(player name),theyOffer(array of {name,pos,ovr,age,salary,years}),picks(strings like "2026 2nd Rd Pick"),cashIncluded(millions int),analysis,fairness("Fair"|"Overpay"|"Underpay"),wouldAccept(bool),counterOffer(string suggestion if not accepting)}]`
    );
    if(Array.isArray(result))setTradeOffers(result);
    setLoading(false);setLoadMsg("");
  };

  // ── Load other team roster for trade machine ──────────────────────────────
  const loadTradeTargets=async(teamName)=>{
    if(!teamName.trim())return;
    setLoadingTargets(true);setTradeTargets([]);
    const result=await aiCall(
      `Generate realistic ${year} ${sport?.toUpperCase()} roster for "${teamName}". 20-25 real players with accurate contracts. Return JSON array: [{id:"ext_N",name,pos,age,ovr(50-99),salary(millions float),years(1-6),noTradeClause(bool),traits(1-2 strings),note}]`,
      "Expert sports analyst. Real player names from that franchise. Return only valid JSON array."
    );
    if(Array.isArray(result)&&result.length>0){
      setTradeTargets(result.map((p,i)=>enrichPlayer({...p,id:`tt_${i}_${Date.now()}`},sport)));
    }else showToast("Couldn't load that team roster","#F59E0B");
    setLoadingTargets(false);
  };

  // ── Cap recalc ────────────────────────────────────────────────────────────
  const recalcCap=useCallback((r)=>{
    // Handled by calcCap function now — just for legacy
  },[]);

  // ── CUT / WAIVE / IL ──────────────────────────────────────────────────────
  const cutPlayer=(p)=>{
    if(p.noTradeClause&&!confirm(`${p.name} has a no-trade clause. Cut anyway?`))return;
    const next=roster.filter(x=>x.id!==p.id);
    setRoster(next);
    setCuts(prev=>[...prev,{...p,releasedYear:year}]);
    logMove(`✂️ Released ${p.name} (${p.pos}) — $${p.salary}M freed, ${p.years}yr remaining`);
    showToast(`Released ${p.name}`);
    save();
  };

  const waivePlayer=(p)=>{
    const next=roster.map(x=>x.id===p.id?{...x,waiverStatus:"on_waivers"}:x);
    setRoster(next);
    setWaived(prev=>[...prev,p]);
    logMove(`📋 Placed ${p.name} on waivers`);
    showToast(`${p.name} placed on waivers (72hr window)`);
    save();
  };

  const placeOnIL=(p,type)=>{
    const days=type==="60"?60:10;
    const next=roster.map(x=>x.id===p.id?{...x,il:type,status:"injured",ilDays:days}:x);
    setRoster(next);
    logMove(`🚑 ${p.name} → ${type}-day IL (${days} games)`);
    showToast(`${p.name} placed on ${type}-day IL`);
    save();
  };

  const activateFromIL=(p)=>{
    const next=roster.map(x=>x.id===p.id?{...x,il:null,status:"active",ilDays:0}:x);
    setRoster(next);
    logMove(`✅ ${p.name} activated from IL`);
    showToast(`${p.name} activated!`);
    save();
  };

  const callUpProspect=(p)=>{
    const capI=calcCap(roster,sport);
    if(capI.space<(p.salary||0.75)){showToast("Not enough cap space","#EF4444");return;}
    const promoted={...p,on40man:true,status:"active",level:null};
    setRoster(prev=>[...prev,promoted]);
    setFarmSystem(prev=>{
      const copy={...prev};
      Object.keys(copy).forEach(lvl=>{copy[lvl]=(copy[lvl]||[]).filter(x=>x.id!==p.id);});
      return copy;
    });
    logMove(`⬆️ Called up ${p.name} (${p.pos}) from ${p.level||"minors"}`);
    showToast(`${p.name} called up!`);
    save();
  };

  const sendToMinors=(p)=>{
    if(p.serviceTime>=3&&!confirm(`${p.name} must clear waivers to be sent down. Continue?`))return;
    const next=roster.filter(x=>x.id!==p.id);
    setRoster(next);
    setFarmSystem(prev=>({...prev,AAA:[...prev.AAA||[],{...p,level:"AAA",on40man:false}]}));
    logMove(`⬇️ Optioned ${p.name} to AAA`);
    showToast(`${p.name} sent to AAA`);
    save();
  };

  // ── Contract restructure & extension ──────────────────────────────────────
  const restructureContract=(player,type)=>{
    const savings=type==="front"?player.salary*0.15:type==="back"?player.salary*0.1:0;
    const newSalary=parseFloat((player.salary-savings/Math.max(1,player.years)).toFixed(2));
    const next=roster.map(p=>p.id===player.id?{...p,salary:newSalary,restructured:type}:p);
    setRoster(next);
    setExtensions(prev=>({...prev,[player.id]:{type,savings,year}}));
    logMove(`💰 Restructured ${player.name} (${type}-load) — $${savings.toFixed(1)}M cap savings`);
    showToast(`Restructured ${player.name}! $${savings.toFixed(1)}M saved`);
    save();
  };

  const extendPlayer=async(player,newYears,newSalary,hasOption)=>{
    const option=hasOption?{type:"club",year:newYears,salary:newSalary*0.9}:null;
    const next=roster.map(p=>p.id===player.id?{...p,years:p.years+newYears,salary:newSalary,extended:true,options:option}:p);
    setRoster(next);
    logMove(`📝 Extended ${player.name}: ${newYears}yr @$${newSalary}M${option?` + club option`:""}`);
    showToast(`Extended ${player.name}!`);
    save();
  };

  const issueQualifyingOffer=(player)=>{
    const qoAmt=parseFloat((player.salary*1.25).toFixed(2));
    setQaOfferPlayers(prev=>({...prev,[player.id]:{amount:qoAmt,accepted:false,deadline:year+1}}));
    logMove(`📋 Issued Qualifying Offer to ${player.name}: $${qoAmt}M/1yr`);
    showToast(`QO issued to ${player.name} ($${qoAmt}M)`);
  };

  // ── Trade execution ────────────────────────────────────────────────────────
  const acceptTradeOffer=async(offer)=>{
    const myPlayerToSend=roster.find(p=>p.name===offer.theyWant);
    if(!myPlayerToSend){showToast("Player no longer on roster","#EF4444");return;}
    if(myPlayerToSend.noTradeClause){showToast(`${myPlayerToSend.name} has a no-trade clause!`,"#EF4444");return;}
    const incomingPlayers=(offer.theyOffer||[]).map((p,i)=>enrichPlayer({...p,id:`trade_${i}_${Date.now()}`,status:"active"},sport));
    const next=[...roster.filter(p=>p.id!==myPlayerToSend.id),...incomingPlayers];
    setRoster(next);
    setTradeOffers(prev=>prev.filter(o=>o!==offer));
    logMove(`🔄 Trade: Sent ${offer.theyWant} to ${offer.fromTeam} | Got ${incomingPlayers.map(p=>p.name).join(", ")}${offer.cashIncluded?` + $${offer.cashIncluded}M cash`:""}`);
    showToast(`Trade completed! ✅`);
    save();
  };

  const evaluateMyTrade=async()=>{
    const{myPlayers,myPicks,theirPlayers,theirPicks,theirTeam,cashRetained}=myTradeOffer;
    setMyTradeOffer(p=>({...p,loading:true,result:null}));
    const mySide=`${myPlayers.map(p=>`${p.name}(OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.noTradeClause?"NTC":""}`).join(",")}${myPicks.length?` + ${myPicks.map(p=>p.label).join(",")}`:""}${cashRetained?` + $${cashRetained}M cash retained`:""}`;
    const theirSide=`${theirPlayers.map(p=>`${p.name}(OVR:${p.ovr},age:${p.age},$${p.salary}M)`).join(",")||"nothing"}${theirPicks?.length?` + ${theirPicks.map(p=>p.label||p).join(",")}`:""}`;
    const result=await aiCall(
      `Evaluate this ${sport?.toUpperCase()} trade:\n${myTeam?.name} sends: ${mySide||"nothing"}\n${theirTeam||"Other team"} sends: ${theirSide}\nContext: ${year} ${sport?.toUpperCase()} market.\nReturn JSON: {accepted(bool),winner("${myTeam?.name||"you"}"|"${theirTeam||"them"}"|"Even"),myGrade,theirGrade,analysis,verdict,capImpact,whyAcceptOrReject,counterSuggestion}`
    );
    setMyTradeOffer(p=>({...p,loading:false,result}));
  };

  const executeMyTrade=()=>{
    const{myPlayers,myPicks,theirPlayers,theirPicks,result,theirTeam}=myTradeOffer;
    if(!result?.accepted){showToast("Trade rejected!","#EF4444");return;}
    const added=(theirPlayers||[]).map((p,i)=>enrichPlayer({...p,id:`mytrade_${i}_${Date.now()}`,status:"active"},sport));
    const next=[...roster.filter(p=>!myPlayers.find(mp=>mp.id===p.id)),...added];
    setRoster(next);
    // Handle pick inventory
    if(myPicks?.length){setPickInventory(prev=>prev.filter(pk=>!myPicks.find(mp=>mp.id===pk.id)));}
    if(theirPicks?.length){setPickInventory(prev=>[...prev,...theirPicks.map(pk=>({...pk,team:myTeam?.name,owned:true}))]);}
    logMove(`🔄 Trade w/ ${theirTeam}: Sent ${myPlayers.map(p=>p.name).join(",")} for ${added.map(p=>p.name).join(",")}`);
    showToast("Trade executed! ✅");
    setMyTradeOffer({myPlayers:[],myPicks:[],theirPlayers:[],theirPicks:[],theirTeam:"",result:null,loading:false,cashRetained:0});
    save();
  };

  // ── FA Bid ────────────────────────────────────────────────────────────────
  const bidOnFA=async(fa,bid,yrs)=>{
    const auction=faAuctions[fa.id];
    const highestAi=auction?.bidders?.length?Math.max(...auction.bidders.map(b=>b.offer)):0;
    if(bid<fa.salary*0.85){showToast("Bid too low","#EF4444");return;}
    const capI=calcCap(roster,sport);
    if(bid>capI.space){showToast(`Over the cap! Only $${capI.space.toFixed(1)}M available`,"#EF4444");return;}
    const won=bid>highestAi*1.04||bid>fa.salary*1.15;
    if(won){
      const signed=enrichPlayer({...fa,salary:bid,years:yrs,status:"active",id:`signed_${fa.id}`,signedYear:year},sport);
      setRoster(prev=>[...prev,signed]);
      setFreeAgents(prev=>prev.filter(f=>f.id!==fa.id));
      setFaAuctions(p=>{const n={...p};delete n[fa.id];return n;});
      logMove(`🖊 Signed ${fa.name} (${fa.pos}): ${yrs}yr @$${bid.toFixed(1)}M`);
      showToast(`Signed ${fa.name}! ✅`);
    }else{
      const winner=auction?.bidders?.sort((a,b)=>b.offer-a.offer)[0]?.team||"Another team";
      showToast(`Lost ${fa.name} to ${winner} ($${highestAi.toFixed(1)}M)`,"#EF4444");
      setFreeAgents(prev=>prev.filter(f=>f.id!==fa.id));
    }
    save();
  };

  // ── Draft pick ────────────────────────────────────────────────────────────
  const draftPick=async(prospect)=>{
    const slotSalary={mlb:0.75,nfl:1.0,nba:2.5,nhl:0.9}[sport]||1.0;
    const drafted=enrichPlayer({...prospect,id:`d_${Date.now()}`,salary:slotSalary,years:4,status:"active",drafted:true,draftedYear:year,level:sport==="mlb"?"A":null,on40man:sport==="mlb"},sport);
    // MLB drafted players go to farm
    if(sport==="mlb"){
      setFarmSystem(prev=>({...prev,A:[...(prev.A||[]),{...drafted,level:"A"}]}));
    }else{
      setRoster(prev=>[...prev,drafted]);
    }
    setMyDraftPicks(prev=>[...prev,drafted]);
    setUndoStack(prev=>[...prev,{type:"draft",player:prospect,board:[...draftBoard]}]);
    setDraftBoard(prev=>prev.filter(p=>p.name!==prospect.name));
    logMove(`🎓 Drafted ${prospect.name} (${prospect.pos}) — Rd ${prospect.round}, Pick #${prospect.pick||"?"}${sport==="mlb"?" → A-ball":""}`);
    showToast(`Drafted ${prospect.name}! ✅`);
    save();
  };

  const undoLastPick=()=>{
    const last=undoStack[undoStack.length-1];
    if(!last||last.type!=="draft")return;
    setDraftBoard(last.board);
    setMyDraftPicks(prev=>prev.filter(p=>p.name!==last.player.name));
    if(sport==="mlb")setFarmSystem(prev=>{const copy={...prev};copy.A=(copy.A||[]).filter(p=>p.name!==last.player.name);return copy;});
    else setRoster(prev=>prev.filter(p=>p.name!==last.player.name));
    setUndoStack(prev=>prev.slice(0,-1));
    showToast(`Undid pick: ${last.player.name}`);
  };

  // ── Trade pick ────────────────────────────────────────────────────────────
  const tradePick=(pick,toTeam)=>{
    setPickInventory(prev=>prev.map(p=>p.id===pick.id?{...p,owned:false,traded:true,tradedTo:toTeam}:p));
    logMove(`📤 Traded ${pick.label} to ${toTeam}`);
    showToast(`${pick.label} traded to ${toTeam}`);
  };

  // ── Grade offseason ────────────────────────────────────────────────────────
  const gradeOffseason=async()=>{
    setLoading(true);setLoadMsg("Grading your offseason...");
    const activeRoster=roster.filter(p=>p.status==="active");
    const teamOvr=Math.round(activeRoster.reduce((s,p)=>s+p.ovr,0)/Math.max(1,activeRoster.length));
    const capI=calcCap(roster,sport);
    const result=await aiCall(
      `Grade the ${myTeam?.name} offseason in ${year} ${sport?.toUpperCase()}:
Moves made: ${allMoves.slice(0,20).map(m=>m.msg).join("; ")}
Team OVR: ${teamOvr} | Cap: $${capI.used.toFixed(1)}M/$${capI.total}M${capI.luxury?" (LUXURY TAX!)":""}
Draft picks acquired: ${myDraftPicks.map(p=>`${p.name}(${p.pos})`).join(",")||"none"}
Farm system size: ${Object.values(farmSystem).flat().length} prospects
Owner goals: ${ownerGoals.join(", ")}
Return JSON: {grade("A+"to"F"),headline,analysis(3 sentences),strengths(array),weaknesses(array),outlook,goalsMet(array),goalsNotMet(array),franchiseTrajectory("Contender"|"Bubble"|"Rebuilding"|"Dynasty Building")}`
    );
    setOffseasonGrade(result);
    setLoading(false);setLoadMsg("");
    save({offseasonGrade:result});
  };

  // ── Simulate season (deep) ────────────────────────────────────────────────
  const simulateSeason=async()=>{
    setLoading(true);setLoadMsg("Simulating season...");setSimProgress(5);
    const active=roster.filter(p=>p.status==="active"&&!p.il);
    const teamOvr=Math.round(active.reduce((s,p)=>s+p.ovr,0)/Math.max(1,active.length));
    const injuries=generateInjuries(roster,sport,GAMES[sport]||82);
    setSimProgress(20);
    setLoadMsg("Running game simulations...");
    const result=await aiCall(
      `Simulate the FULL ${year} ${sport?.toUpperCase()} season for the ${myTeam?.name}.
Team OVR: ${teamOvr}. Scheme: ${scheme}. Cap: $${calcCap(roster,sport).used.toFixed(1)}M.
Active roster (top 12): ${active.slice(0,12).map(p=>`${p.name}(${p.pos},OVR:${p.ovr},age:${p.age})`).join(", ")}.
Farm system (top AAA): ${(farmSystem.AAA||[]).slice(0,3).map(p=>p.name).join(", ")||"none"}.
Total games: ${GAMES[sport]||82}. Injuries already occurred: ${injuries.slice(0,4).map(i=>`${i.name}(${i.type},${i.games_missed}g)`).join(", ")||"none"}.

Return JSON: {
  wins,losses,ties(0 if N/A),record,playoffSeed(null if missed),madePlayoffs(bool),
  playoffRounds([{opponent,result("Won 4-2"|"Lost 3-4" etc),games}]),
  championshipResult,
  teamOVR,
  mvp:{name,stats,award:"MVP"},
  allStarSelections:[{name,pos}],
  awardWinners:[{name,award,stats}],
  topPerformers:[{name,pos,keyStats,grade}],
  playerStats:[{name,pos,${sport==="mlb"?"G,AB,R,H,HR,RBI,AVG,OPS,ERA,W,L,SV,K,WHIP":"G,PTS,AST,REB,MIN,FG%,TD,YDS,REC,G,A,SOG,SV%"}}],
  injuries:[{name,type,games_missed,severity,gameNumber}],
  summary,
  nextYearOutlook
}`,
      "You are an expert sports simulation engine. Generate realistic season results. Return only valid JSON."
    ,3000);
    setSimProgress(85);
    if(result?.wins!==undefined){
      // Merge AI injuries with our generated ones
      const allInjuries=[...injuries,...(result.injuries||[]).filter(i=>!injuries.find(j=>j.name===i.name))];
      const finalResult={...result,injuries:allInjuries};
      setSimResult(finalResult);
      setAwardWinners(result.awardWinners||[]);
      setAllStarRoster(result.allStarSelections||[]);
      // Apply injuries to roster
      const injuredNames=new Set(allInjuries.map(i=>i.name));
      setRoster(prev=>prev.map(p=>injuredNames.has(p.name)?{...p,il:allInjuries.find(i=>i.name===p.name)?.il||"10",status:"injured"}:p));
      // Append to history
      setSimHistory(prev=>[...prev,{year,record:finalResult.record,result:finalResult.championshipResult,madePlayoffs:finalResult.madePlayoffs}]);
      setPhase("results");
      logMove(`🏆 ${year} Season: ${finalResult.record} — ${finalResult.championshipResult}`);
      save({simResult:finalResult});
      showToast(`Season complete! ${finalResult.record} 🏆`);
    }else{
      showToast("Simulation error — check console","#EF4444");
    }
    setLoading(false);setSimProgress(0);setLoadMsg("");
  };

  // ── Advance to next season ─────────────────────────────────────────────────
  const nextSeason=()=>{
    // Progress all players
    const progressed=roster.map(p=>progressPlayer(p,simResult,year)).filter(p=>p.years>0||p.ovr>65);
    // Progress farm too
    const newFarm={};
    Object.keys(farmSystem).forEach(lvl=>{
      newFarm[lvl]=(farmSystem[lvl]||[]).map(p=>({...p,age:p.age+1,ovr:Math.min(p.potential||90,p.ovr+Math.floor(Math.random()*4)),eta:Math.max(0,(p.eta||2)-1)}));
    });
    // Promote any farm player with eta=0 and ovr>68 to 40-man
    const promotable=newFarm.AAA?.filter(p=>p.eta<=0&&p.ovr>=68)||[];
    if(promotable.length)showToast(`${promotable.length} prospects ready for promotion!`,"#F59E0B");
    // Cap raise
    const capBump=Math.floor(CAP_TABLE[sport]?.cap*0.03)||5;
    Object.keys(CAP_TABLE).forEach(s=>{CAP_TABLE[s].cap+=capBump;CAP_TABLE[s].luxury+=capBump;});
    // QO deadline — players who rejected QO become FAs
    const qaRejected=Object.entries(qaOfferPlayers).filter(([,v])=>!v.accepted).map(([id])=>id);
    const finalRoster=progressed.filter(p=>!qaRejected.includes(p.id));
    setRoster(finalRoster);
    setFarmSystem(newFarm);
    setYear(y=>y+1);
    setSeason(s=>s+1);
    setSimResult(null);setOffseasonGrade(null);setAllMoves([]);
    setMyDraftPicks([]);setDraftBoard([]);setCuts([]);setTradeOffers([]);
    setFreeAgents([]);setFaAuctions({});setQaOfferPlayers({});
    setAwardWinners(null);setAllStarRoster(null);setUndoStack([]);
    setPhase("steps");setStep("trim");
    showToast(`Welcome to ${year+1} offseason! Cap raised $${capBump}M 🎉`);
    save();
    // Reload FA market for new year
    if(myTeam&&sport)loadFAs(sport,myTeam,finalRoster);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP RENDERERS
  // ─────────────────────────────────────────────────────────────────────────
  const renderStep=()=>{
    switch(step){
      case"trim": return<TrimStepV3 roster={roster} sport={sport} ac={ac} rules={rules} onCut={cutPlayer} onWaive={waivePlayer} onIL={placeOnIL} onActivate={activateFromIL} onSendDown={sendToMinors} getCutSuggestions={async()=>{setLoading(true);setLoadMsg("Analyzing...");const r=await aiCall(`Analyze and suggest 3-5 cuts for ${myTeam?.name}. Roster: ${roster.map(p=>`${p.name}(${p.pos},OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.years}yr)`).join(", ")}. Return JSON: [{name,reason,savings}]`);setLoading(false);setLoadMsg("");return Array.isArray(r)?r:[];}} mob={mob}/>;
      case"cap": return<CapStepV3 roster={roster} sport={sport} ac={ac} capInfo={calcCap(roster,sport)} onRestructure={restructureContract} onExtend={extendPlayer} onQO={issueQualifyingOffer} qaOffers={qaOfferPlayers} extensions={extensions} year={year} mob={mob}/>;
      case"trades": return<TradesStepV3 roster={roster} sport={sport} ac={ac} myTeam={myTeam} tradeOffers={tradeOffers} myOffer={myTradeOffer} setMyOffer={setMyTradeOffer} onLoadOffers={loadTradeOffers} onAccept={acceptTradeOffer} onEvaluate={evaluateMyTrade} onExecute={executeMyTrade} onLoadTargets={loadTradeTargets} tradeTargets={tradeTargets} loadingTargets={loadingTargets} onTradeBlock={(p)=>setTradeBlock(prev=>prev.find(x=>x.id===p.id)?prev.filter(x=>x.id!==p.id):[...prev,p])} tradeBlock={tradeBlock} pickInventory={pickInventory} mob={mob}/>;
      case"fa": return<FAStepV3 freeAgents={freeAgents} sport={sport} ac={ac} capInfo={calcCap(roster,sport)} auctions={faAuctions} myTeam={myTeam} onBid={bidOnFA} mob={mob}/>;
      case"draft": return<DraftStepV3 draftBoard={draftBoard} picks={myDraftPicks} sport={sport} ac={ac} year={year} aiOffers={aiDraftOffers} pickInventory={pickInventory} onLoadBoard={()=>{if(!draftBoard.length)loadDraftBoard();}} onDraft={draftPick} onUndo={undoLastPick} onTradePick={tradePick} canPickTrade={rules.pickTrade} mob={mob}/>;
      case"command": return<CommandStepV3 roster={roster} setRoster={setRoster} farmSystem={farmSystem} depthChart={depthChart} setDepthChart={setDepthChart} scheme={scheme} setScheme={setScheme} sport={sport} ac={ac} myTeam={myTeam} allMoves={allMoves} capInfo={calcCap(roster,sport)} rules={rules} rosterTab={rosterTab} setRosterTab={setRosterTab} onCallUp={callUpProspect} onSendDown={sendToMinors} onIL={placeOnIL} onActivate={activateFromIL} budget={budget} setBudget={setBudget} ownerGoals={ownerGoals} mob={mob}/>;
      case"review": return<ReviewStepV3 roster={roster} allMoves={allMoves} myDraftPicks={myDraftPicks} grade={offseasonGrade} sport={sport} ac={ac} year={year} season={season} simHistory={simHistory} farmSystem={farmSystem} capInfo={calcCap(roster,sport)} ownerGoals={ownerGoals} onGrade={gradeOffseason} onSimulate={simulateSeason} simProgress={simProgress} mob={mob}/>;
      default: return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  SETUP SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if(phase==="setup")return(
    <div style={{maxWidth:960,margin:"0 auto",padding:mob?"10px 10px 100px":"20px 20px 80px"}}>
      {toast&&<div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",padding:"10px 20px",borderRadius:20,fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,.5)"}}>{toast.msg}</div>}
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(3,7,18,.9)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}><div className="spin" style={{fontSize:36}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",fontSize:13}}>{loadMsg}</div></div>}
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:52,marginBottom:8}}>🏆</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:30,fontWeight:900,color:"#E2E8F0",letterSpacing:".04em",marginBottom:6}}>GM FRANCHISE MODE</div>
        <div style={{fontSize:13,color:"#475569",maxWidth:420,margin:"0 auto"}}>Full franchise mode — trades, contracts, draft, farm system, injuries, multi-year dynasty building.</div>
      </div>
      {savedState&&(
        <div onClick={loadSave} style={{background:"rgba(0,212,255,.07)",border:"1px solid rgba(0,212,255,.22)",borderRadius:14,padding:"14px 18px",marginBottom:20,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#00D4FF",fontWeight:700,marginBottom:2}}>▶ RESUME FRANCHISE{savedState._migrated?" (Migrated from v2)":""}</div><div style={{fontSize:12,color:"#94A3B8"}}>{savedState.sport?.toUpperCase()} · {savedState.myTeam?.name} · {savedState.year||2025} · Season {savedState.season||1}</div></div>
          <span style={{fontSize:22}}>▶</span>
        </div>
      )}
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:10}}>SELECT SPORT</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:22}}>
        {GM_SPORTS.map(s=>(
          <button key={s.id} onClick={()=>{setSport(s.id);loadTeams(s.id);}}
            style={{padding:"16px 8px",borderRadius:14,cursor:"pointer",border:`2px solid ${sport===s.id?s.color+"88":"rgba(255,255,255,.07)"}`,background:sport===s.id?s.color+"18":"rgba(255,255,255,.03)",transition:"all .2s"}}>
            <div style={{fontSize:28,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,color:sport===s.id?s.color:"#94A3B8"}}>{s.label}</div>
          </button>
        ))}
      </div>
      {sport&&teams.length>0&&(
        <>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:10}}>SELECT YOUR TEAM</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(4,1fr)":"repeat(auto-fill,minmax(110px,1fr))",gap:8,marginBottom:18}}>
            {teams.map(t=>(
              <button key={t.id} onClick={()=>setMyTeam(t)}
                style={{padding:"10px 6px",borderRadius:12,cursor:"pointer",border:`2px solid ${myTeam?.id===t.id?ac+"88":"rgba(255,255,255,.06)"}`,background:myTeam?.id===t.id?ac+"18":"rgba(255,255,255,.03)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .2s"}}>
                {t.logo?<img src={t.logo} style={{width:mob?28:36,height:mob?28:36,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>:<div style={{fontSize:20}}>{sc?.icon}</div>}
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?7:9,fontWeight:700,color:myTeam?.id===t.id?ac:"#64748B",textAlign:"center"}}>{t.abbr}</div>
              </button>
            ))}
          </div>
          {myTeam&&<button onClick={()=>{loadRoster(myTeam,sport);setPhase("steps");}} style={{width:"100%",padding:"16px",borderRadius:14,background:`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#fff",letterSpacing:".08em"}}>START FRANCHISE: {myTeam.name.toUpperCase()} →</button>}
        </>
      )}
    </div>
  );

  // ─── RESULTS SCREEN ────────────────────────────────────────────────────────
  if(phase==="results"&&simResult)return(
    <div style={{maxWidth:960,margin:"0 auto",padding:mob?"10px 10px 100px":"20px 20px 80px"}}>
      {toast&&<div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",padding:"10px 20px",borderRadius:20,fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}
      {/* Season banner */}
      <div style={{textAlign:"center",padding:"24px 20px",borderRadius:18,background:`linear-gradient(135deg,${ac}22,rgba(255,255,255,.03))`,border:`1px solid ${ac}44`,marginBottom:18}}>
        <div style={{fontSize:48,marginBottom:8}}>{simResult.madePlayoffs?"🏆":"📊"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?24:36,fontWeight:900,color:ac,marginBottom:4}}>{simResult.record}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?11:14,color:"#E2E8F0",marginBottom:6}}>{simResult.championshipResult}</div>
        {simResult.playoffRounds?.map((rnd,i)=><div key={i} style={{fontSize:11,color:"#64748B"}}>{rnd.result}</div>)}
        <div style={{fontSize:12,color:"#64748B",marginTop:6}}>{simResult.summary}</div>
      </div>
      {/* Awards */}
      {simResult.awardWinners?.length>0&&(
        <div style={{marginBottom:14,padding:"12px 16px",borderRadius:14,background:"rgba(168,85,247,.07)",border:"1px solid rgba(168,85,247,.2)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#A855F7",marginBottom:8}}>🏅 AWARDS</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {simResult.awardWinners.map((a,i)=><div key={i} style={{padding:"4px 10px",borderRadius:10,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",fontSize:10,color:"#E2E8F0"}}><span style={{color:"#A855F7",fontWeight:700}}>{a.award}</span>: {a.name} <span style={{fontSize:9,color:"#64748B"}}>{a.stats}</span></div>)}
          </div>
        </div>
      )}
      {/* All-Stars */}
      {simResult.allStarSelections?.length>0&&(
        <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#22C55E",marginBottom:6}}>⭐ YOUR ALL-STARS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{simResult.allStarSelections.map((p,i)=><span key={i} style={{fontSize:10,color:"#E2E8F0",padding:"2px 8px",borderRadius:8,background:"rgba(34,197,94,.12)"}}>{p.name} ({p.pos})</span>)}</div>
        </div>
      )}
      {/* Top performers */}
      {simResult.topPerformers?.length>0&&(
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:8}}>TOP PERFORMERS</div>
          {simResult.topPerformers.map((p,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:5,alignItems:"center"}}>
              <GradeChip grade={p.grade}/><div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:ac,fontSize:9}}>{p.pos}</span></div><div style={{fontSize:10,color:"#64748B"}}>{p.keyStats}</div></div>
            </div>
          ))}
        </div>
      )}
      {/* Player stats table */}
      {simResult.playerStats?.length>0&&(
        <div style={{marginBottom:14,overflowX:"auto",borderRadius:12,border:"1px solid rgba(255,255,255,.07)"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:"rgba(255,255,255,.05)"}}>
              <td style={{padding:"8px 12px",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",minWidth:130}}>PLAYER</td>
              {Object.keys(simResult.playerStats[0]||{}).filter(k=>k!=="name"&&k!=="pos").slice(0,8).map(k=><td key={k} style={{padding:"8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569"}}>{k}</td>)}
            </tr></thead>
            <tbody>{simResult.playerStats.map((p,i)=>(
              <tr key={i} style={{background:i%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <td style={{padding:"7px 12px"}}><div style={{fontWeight:700,color:"#E2E8F0",fontSize:11}}>{p.name}</div><div style={{fontSize:9,color:"#475569"}}>{p.pos}</div></td>
                {Object.entries(p).filter(([k])=>k!=="name"&&k!=="pos").slice(0,8).map(([k,v],j)=><td key={j} style={{padding:"7px 8px",textAlign:"center",color:"#94A3B8"}}>{v}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {/* Injuries */}
      {simResult.injuries?.length>0&&(
        <div style={{marginBottom:14,padding:"12px 14px",borderRadius:12,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#EF4444",marginBottom:8}}>🚑 INJURIES</div>
          {simResult.injuries.map((inj,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#94A3B8"}}>{inj.name} — {inj.type}</span><span style={{color:inj.severity==="Season-ending"?"#EF4444":"#F59E0B"}}>{inj.games_missed}G · {inj.severity}</span></div>)}
        </div>
      )}
      {/* History */}
      {simHistory.length>1&&(
        <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:8}}>📚 FRANCHISE HISTORY</div>
          {simHistory.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0"}}><span style={{color:"#64748B"}}>{s.year}</span><span style={{color:"#94A3B8",fontWeight:700}}>{s.record}</span><span style={{color:s.madePlayoffs?"#22C55E":"#475569",fontSize:10}}>{s.result}</span></div>)}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={()=>{setPhase("steps");setStep("review");}} style={{padding:"12px",borderRadius:12,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8"}}>← Review</button>
        <button onClick={nextSeason} style={{padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:"#fff"}}>▶ YEAR {year+1} OFFSEASON →</button>
      </div>
    </div>
  );

  // ─── MAIN STEPS SHELL ──────────────────────────────────────────────────────
  const curStep=GM_STEPS.find(s=>s.id===step);
  const curIdx=GM_STEPS.findIndex(s=>s.id===step);
  const capI=calcCap(roster,sport);
  return(
    <div style={{maxWidth:1020,margin:"0 auto",padding:mob?"8px 8px 100px":"16px 20px 80px"}}>
      {toast&&<div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",padding:"10px 20px",borderRadius:20,fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,zIndex:9999,boxShadow:"0 6px 24px rgba(0,0,0,.5)"}}>{toast.msg}</div>}
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(3,7,18,.9)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}><div className="spin" style={{fontSize:32}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",fontSize:13,maxWidth:300,textAlign:"center"}}>{loadMsg}</div>{simProgress>0&&<div style={{width:260,height:5,background:"rgba(255,255,255,.1)",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:ac,width:`${simProgress}%`,transition:"width .6s"}}/></div>}</div>}
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
        {myTeam?.logo&&<img src={myTeam.logo} style={{width:36,height:36,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:15,fontWeight:900,color:"#E2E8F0"}}>{myTeam?.name?.toUpperCase()} <span style={{fontSize:9,color:ac}}>S{season} · {year}</span></div>
          <div style={{fontSize:10,color:"#475569"}}>{sport?.toUpperCase()} Franchise</div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          <button onClick={()=>setCmdOpen(o=>!o)} style={{padding:"5px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,cursor:"pointer"}}>⚙️ CMD</button>
          <button onClick={()=>{if(confirm("Return to setup?"))setPhase("setup");}} style={{padding:"5px 8px",borderRadius:9,background:"none",border:"1px solid rgba(255,255,255,.06)",color:"#334155",fontSize:9,cursor:"pointer"}}>✕</button>
        </div>
      </div>
      <div style={{marginBottom:12}}><CapBar used={capI.used} total={capI.total} ac={ac}/></div>
      {capI.luxury&&<div style={{fontSize:10,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",marginBottom:8}}>⚠️ LUXURY TAX: ${capI.luxuryAmt.toFixed(1)}M over threshold</div>}
      {/* CMD drawer */}
      {cmdOpen&&(
        <div style={{marginBottom:14,padding:"12px 14px",borderRadius:14,background:"rgba(0,0,0,.5)",border:"1px solid rgba(255,255,255,.1)",maxHeight:260,overflowY:"auto"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:ac,marginBottom:8}}>⚙️ MOVES LOG</div>
          {allMoves.length===0&&<div style={{fontSize:10,color:"#334155"}}>No moves yet</div>}
          {allMoves.slice(0,15).map((m,i)=><div key={i} style={{fontSize:10,color:"#64748B",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>{m.msg}</div>)}
        </div>
      )}
      {/* Step pills */}
      <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {GM_STEPS.map((s,i)=>{
          const done=i<curIdx,active=s.id===step;
          return<button key={s.id} onClick={()=>{if(s.id==="draft"&&!draftBoard.length)loadDraftBoard();setStep(s.id);}}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:mob?"5px 8px":"7px 12px",borderRadius:12,cursor:"pointer",flexShrink:0,transition:"all .2s",border:`1px solid ${active?ac+"66":done?ac+"33":"rgba(255,255,255,.07)"}`,background:active?ac+"18":done?ac+"08":"rgba(255,255,255,.02)"}}>
            <div style={{fontSize:mob?13:15}}>{s.icon}</div>
            {!mob&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,color:active?ac:done?ac+"99":"#334155",whiteSpace:"nowrap"}}>Step {s.n}</div>}
            {!mob&&<div style={{fontSize:7,color:active?"#E2E8F0":"#334155",whiteSpace:"nowrap"}}>{s.label}</div>}
          </button>;
        })}
      </div>
      {/* Step title */}
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?14:18,fontWeight:900,color:"#E2E8F0"}}>{curStep?.icon} Step {curStep?.n}: {curStep?.label}</div>
        <div style={{fontSize:11,color:"#475569"}}>{curStep?.desc}</div>
      </div>
      {renderStep()}
      <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}>
        {curIdx>0&&<button onClick={()=>setStep(GM_STEPS[curIdx-1].id)} style={{padding:"10px 18px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#475569"}}>← Back</button>}
        {curIdx<GM_STEPS.length-1&&<button onClick={()=>{if(GM_STEPS[curIdx+1].id==="draft"&&!draftBoard.length)loadDraftBoard();setStep(GM_STEPS[curIdx+1].id);}} style={{padding:"10px 20px",borderRadius:12,background:ac+"22",border:`1px solid ${ac}44`,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:ac}}>Next: {GM_STEPS[curIdx+1].label} →</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP COMPONENTS (v3)
// ─────────────────────────────────────────────────────────────────────────────

function TrimStepV3({roster,sport,ac,rules,onCut,onWaive,onIL,onActivate,onSendDown,getCutSuggestions,mob}){
  const[suggestions,setSuggestions]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[filter,setFilter]=useState("all"); // all|il|expiring|overpaid
  const loadSugg=async()=>{setLoaded(true);const s=await getCutSuggestions();setSuggestions(s);};
  const filtered=roster.filter(Boolean).filter(p=>{
    if(filter==="il")return p.il||p.status==="injured";
    if(filter==="expiring")return p.years<=1;
    if(filter==="overpaid"){const capT=CAP_TABLE[sport]||{cap:200};const mkt=((p.ovr||70)/99)*capT.cap*0.18;return p.salary>mkt*1.4;}
    return true;
  });
  const capT=CAP_TABLE[sport]||{cap:200};
  return(<div>
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{roster.length} PLAYERS</div>
      {[["all","All"],["il","🚑 IL/Injured"],["expiring","📋 Expiring"],["overpaid","💸 Overpaid"]].map(([v,l])=>(
        <button key={v} onClick={()=>setFilter(v)} style={{padding:"4px 10px",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${filter===v?ac+"55":"rgba(255,255,255,.08)"}`,background:filter===v?ac+"14":"rgba(255,255,255,.02)",color:filter===v?ac:"#475569"}}>{l}</button>
      ))}
      {!loaded&&<button onClick={loadSugg} style={{padding:"5px 12px",borderRadius:9,background:"rgba(168,85,247,.12)",border:"1px solid rgba(168,85,247,.3)",color:"#A855F7",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginLeft:"auto"}}>🤖 AI Suggestions</button>}
    </div>
    {suggestions.length>0&&(
      <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:"rgba(168,85,247,.07)",border:"1px solid rgba(168,85,247,.2)"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#A855F7",marginBottom:6}}>AI RECOMMENDS CUTTING</div>
        {suggestions.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#E2E8F0",fontWeight:600}}>{s.name}</span><span style={{color:"#64748B"}}>{s.reason} · saves ${s.savings}M</span></div>)}
      </div>
    )}
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {filtered.map((p,i)=>{
        const mktVal=((p.ovr||70)/99)*capT.cap*0.18;
        const overPaid=p.salary>mktVal*1.4;
        return(
          <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${p.il?"rgba(239,68,68,.25)":p.years<=1?"rgba(245,158,11,.2)":"rgba(255,255,255,.06)"}`,alignItems:"center"}}>
            <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,.05)"}}>
              <img src={p.headshot||""} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span>
                <span style={{fontSize:9,color:ac}}>{p.pos}</span>
                {p.il&&<span style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif"}}>{p.il}-day IL</span>}
                {p.years<=1&&!p.il&&<span style={{fontSize:8,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>EXP</span>}
                {overPaid&&<span style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif"}}>OVERPAID</span>}
                {p.noTradeClause&&<span style={{fontSize:8,color:"#A855F7",fontFamily:"'Orbitron',sans-serif"}}>NTC</span>}
                {(p.traits||[]).map((t,j)=><span key={j} style={{fontSize:8,color:"#334155",padding:"1px 5px",borderRadius:4,background:"rgba(255,255,255,.04)"}}>{t}</span>)}
              </div>
              <div style={{fontSize:9,color:"#475569"}}>Age {p.age} · ${p.salary}M · {p.years}yr · Svc: {p.serviceTime||0}yr</div>
            </div>
            <OVRBadge ovr={p.ovr}/>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              {p.il?<button onClick={()=>onActivate(p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#22C55E",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>Activate</button>:
               rules.il10&&!p.il?<button onClick={()=>onIL(p,"10")} style={{padding:"4px 7px",borderRadius:7,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",color:"#F59E0B",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>IL</button>:null}
              {rules.waivers&&!p.il&&<button onClick={()=>onWaive(p)} style={{padding:"4px 7px",borderRadius:7,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#64748B",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>Waive</button>}
              <button onClick={()=>onCut(p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>Cut</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>);
}

function CapStepV3({roster,sport,ac,capInfo,onRestructure,onExtend,extensions,onQO,qaOffers,year,mob}){
  const[extTarget,setExtTarget]=useState(null);
  const[extYears,setExtYears]=useState(2);
  const[extSalary,setExtSalary]=useState("");
  const[hasOption,setHasOption]=useState(false);
  const[tab,setTab]=useState("restructure");
  const restructurable=roster.filter(p=>!p.restructured&&p.years>1&&p.salary>2&&p.restructurable!==false);
  const extendable=roster.filter(p=>!p.extended&&p.years<=2&&p.ovr>=68);
  const expiring=roster.filter(p=>p.years<=1&&p.ovr>=72);
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:14}}>
      {[["restructure","💰 Restructure"],["extend","📝 Extend"],["qo","📋 QO / Options"],["luxury","💸 Tax Sheet"]].map(([t,l])=>(
        <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 12px",borderRadius:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${tab===t?ac+"55":"rgba(255,255,255,.08)"}`,background:tab===t?ac+"14":"rgba(255,255,255,.02)",color:tab===t?ac:"#475569"}}>{l}</button>
      ))}
    </div>
    {tab==="restructure"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Restructuring converts base salary into signing bonus, spreading cap savings across years.</div>
      {restructurable.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No restructure candidates</div>}
      {restructurable.map((p,i)=>(
        <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${extensions[p.id]?"rgba(34,197,94,.3)":"rgba(255,255,255,.07)"}`,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:ac,fontSize:9}}>{p.pos}</span></div><div style={{fontSize:10,color:"#475569"}}>${p.salary}M · {p.years}yr · Age {p.age}</div></div>
            <OVRBadge ovr={p.ovr}/>
          </div>
          {extensions[p.id]?<div style={{fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>✓ Restructured ({extensions[p.id].type}) — saved ${extensions[p.id].savings?.toFixed(1)}M</div>:(
            <div style={{display:"flex",gap:5}}>
              {["front","flat","back"].map(t=>(
                <button key={t} onClick={()=>onRestructure(p,t)} style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${ac}44`,background:ac+"14",color:ac}}>
                  {t==="front"?"Front-load (save 15%)":t==="flat"?"Flat (save 0%)":"Back-load (save 10%)"}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>)}
    {tab==="extend"&&(<div>
      {extendable.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No extension candidates</div>}
      {extendable.map((p,i)=>(
        <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${extTarget?.id===p.id?"rgba(168,85,247,.4)":"rgba(255,255,255,.07)"}`,marginBottom:8,cursor:"pointer"}} onClick={()=>setExtTarget(extTarget?.id===p.id?null:p)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:"#A855F7",fontSize:9}}>{p.pos}</span>{p.extended?<span style={{color:"#22C55E",fontSize:9}}> ✓ Extended</span>:""}</div><div style={{fontSize:10,color:"#475569"}}>${p.salary}M · {p.years}yr left · Pot: {p.potential}</div></div>
            <OVRBadge ovr={p.ovr}/>
          </div>
          {extTarget?.id===p.id&&!p.extended&&(
            <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:"#475569",marginBottom:3}}>Add Years</div><input type="number" min="1" max="7" value={extYears} onChange={e=>setExtYears(parseInt(e.target.value)||2)}/></div>
                <div><div style={{fontSize:9,color:"#475569",marginBottom:3}}>New $/yr (M)</div><input type="number" step="0.5" value={extSalary} onChange={e=>setExtSalary(e.target.value)} placeholder={p.salary.toFixed(1)}/></div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <label style={{fontSize:10,color:"#94A3B8",display:"flex",gap:5,alignItems:"center",cursor:"pointer"}}><input type="checkbox" checked={hasOption} onChange={e=>setHasOption(e.target.checked)}/> Include Club Option (yr {p.years+extYears+1})</label>
              </div>
              <button onClick={()=>{onExtend(p,extYears,parseFloat(extSalary)||p.salary,hasOption);setExtTarget(null);}} style={{padding:"8px",borderRadius:9,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",color:"#A855F7",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>📝 Offer Extension</button>
            </div>
          )}
        </div>
      ))}
    </div>)}
    {tab==="qo"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Issue a Qualifying Offer to expiring players (≥1yr service). If rejected, you receive draft pick compensation.</div>
      {expiring.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No QO candidates</div>}
      {expiring.map((p,i)=>{
        const qoSent=qaOffers[p.id];
        return(
          <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:`1px solid ${qoSent?"rgba(34,197,94,.25)":"rgba(255,255,255,.07)"}`,marginBottom:6,alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:ac,fontSize:9}}>{p.pos}</span></div><div style={{fontSize:10,color:"#475569"}}>${p.salary}M · expiring · svc: {p.serviceTime||0}yr</div></div>
            <OVRBadge ovr={p.ovr}/>
            {qoSent?<div style={{fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>QO Sent (${qoSent.amount}M)</div>:
             <button onClick={()=>onQO(p)} style={{padding:"5px 10px",borderRadius:8,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>Issue QO</button>}
          </div>
        );
      })}
    </div>)}
    {tab==="luxury"&&(<div>
      <div style={{padding:"14px",borderRadius:14,background:capInfo.luxury?"rgba(239,68,68,.07)":"rgba(34,197,94,.06)",border:`1px solid ${capInfo.luxury?"rgba(239,68,68,.3)":"rgba(34,197,94,.2)"}`,marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:capInfo.luxury?"#EF4444":"#22C55E",fontWeight:700,marginBottom:6}}>{capInfo.luxury?"⚠️ LUXURY TAX PAYER":"✅ UNDER LUXURY TAX"}</div>
        <div style={{fontSize:12,color:"#94A3B8"}}>Payroll: ${capInfo.used.toFixed(1)}M / Cap: ${capInfo.total}M</div>
        {capInfo.luxury&&<div style={{fontSize:11,color:"#EF4444",marginTop:4}}>Tax amount: ${capInfo.luxuryAmt.toFixed(1)}M over threshold</div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {[...roster.filter(Boolean)].sort((a,b)=>b.salary-a.salary).map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"7px 12px",borderRadius:9,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.04)",alignItems:"center"}}>
            <div style={{flex:1}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span><span style={{fontSize:9,color:"#475569",marginLeft:5}}>{p.pos} · {p.years}yr</span></div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:p.salary>20?"#EF4444":p.salary>10?"#F59E0B":"#22C55E"}}>${p.salary.toFixed(1)}M</div>
          </div>
        ))}
      </div>
    </div>)}
  </div>);
}

function TradesStepV3({roster,sport,ac,myTeam,tradeOffers,myOffer,setMyOffer,onLoadOffers,onAccept,onEvaluate,onExecute,onLoadTargets,tradeTargets,loadingTargets,onTradeBlock,tradeBlock,pickInventory,mob}){
  const[subTab,setSubTab]=useState("incoming");
  const myPicks=pickInventory.filter(pk=>pk.owned&&!pk.traded);
  const canPickTrade=ROSTER_RULES[sport]?.pickTrade||false;
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
      {[["incoming","📩 Incoming"+(tradeOffers.length>0?` (${tradeOffers.length})`:"")] ,["create","🔨 Offer Trade"],["block","🚫 Trade Block"],["finder","🔍 Trade Finder"]].map(([t,l])=>(
        <button key={t} onClick={()=>{setSubTab(t);if(t==="incoming"&&!tradeOffers.length)onLoadOffers();}} style={{padding:"6px 12px",borderRadius:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${subTab===t?ac+"55":"rgba(255,255,255,.08)"}`,background:subTab===t?ac+"14":"rgba(255,255,255,.02)",color:subTab===t?ac:"#475569"}}>{l}</button>
      ))}
    </div>
    {subTab==="incoming"&&(<div>
      {!tradeOffers.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>Loading league offers...</div>}
      {tradeOffers.map((offer,i)=>(
        <div key={i} style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:`1px solid ${offer.wouldAccept?"rgba(34,197,94,.2)":"rgba(239,68,68,.15)"}`,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{offer.fromTeam}</div><div style={{fontSize:9,color:"#475569"}}>{offer.teamNeeds}</div></div>
            <div style={{textAlign:"right",fontSize:10,color:offer.wouldAccept?"#22C55E":"#EF4444",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{offer.wouldAccept?"Would Accept":"Would Counter"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:8}}>
            <div><div style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>THEY WANT</div><div style={{fontSize:10,color:"#94A3B8"}}>{offer.theyWant}</div></div>
            <span style={{fontSize:16,color:"#475569"}}>⇄</span>
            <div><div style={{fontSize:8,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>YOU GET</div><div style={{fontSize:10,color:"#94A3B8"}}>{offer.theyOffer?.map(p=>p.name).join(", ")}{offer.picks?.length?` + ${offer.picks.join(", ")}`:""}{offer.cashIncluded?` + $${offer.cashIncluded}M`:""}</div></div>
          </div>
          <div style={{fontSize:10,color:"#64748B",marginBottom:6}}>{offer.analysis}</div>
          {!offer.wouldAccept&&offer.counterOffer&&<div style={{fontSize:9,color:"#F59E0B",marginBottom:6}}>💡 Counter suggestion: {offer.counterOffer}</div>}
          {offer.wouldAccept&&<button onClick={()=>onAccept(offer)} style={{padding:"7px 14px",borderRadius:10,background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>✅ Accept Trade</button>}
        </div>
      ))}
    </div>)}
    {subTab==="create"&&(<div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:ac,marginBottom:6}}>YOU SEND</div>
          <div style={{maxHeight:280,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {roster.filter(Boolean).map((p,i)=>{
              const sel=myOffer.myPlayers.find(x=>x.id===p.id);
              return<div key={i} onClick={()=>setMyOffer(prev=>({...prev,result:null,myPlayers:sel?prev.myPlayers.filter(x=>x.id!==p.id):[...prev.myPlayers,p]}))} style={{padding:"7px 10px",borderRadius:9,cursor:"pointer",border:`1px solid ${sel?ac+"55":"rgba(255,255,255,.05)"}`,background:sel?ac+"12":"transparent",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:sel?700:400,color:sel?ac:"#94A3B8"}}>{p.name}{p.noTradeClause?" 🚫":""}</span>
                <span style={{fontSize:9,color:"#475569"}}>{p.pos} {p.ovr}</span>
              </div>;
            })}
          </div>
          {canPickTrade&&myPicks.length>0&&(<div style={{marginTop:8}}>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>INCLUDE PICKS</div>
            {myPicks.map((pk,i)=>{
              const sel=myOffer.myPicks?.find(x=>x.id===pk.id);
              return<div key={i} onClick={()=>setMyOffer(prev=>({...prev,myPicks:sel?(prev.myPicks||[]).filter(x=>x.id!==pk.id):[...(prev.myPicks||[]),pk]}))} style={{padding:"5px 9px",borderRadius:8,cursor:"pointer",marginBottom:3,border:`1px solid ${sel?ac+"44":"rgba(255,255,255,.05)"}`,background:sel?ac+"10":"transparent",fontSize:10,color:sel?ac:"#64748B"}}>{pk.label}</div>;
            })}
          </div>)}
          {myOffer.myPlayers?.length>0&&<div style={{marginTop:6,fontSize:9,color:ac,fontFamily:"'Orbitron',sans-serif"}}>Sending: {myOffer.myPlayers.map(p=>p.name).join(", ")}</div>}
        </div>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#EF4444",marginBottom:6}}>YOU RECEIVE</div>
          <div style={{display:"flex",gap:5,marginBottom:8}}>
            <input placeholder="Team name e.g. New York Yankees…" value={myOffer.theirTeam||""} onChange={e=>setMyOffer(p=>({...p,theirTeam:e.target.value,result:null}))} style={{flex:1}}/>
            <button onClick={()=>onLoadTargets(myOffer.theirTeam)} disabled={loadingTargets||!myOffer.theirTeam?.trim()} style={{padding:"6px 10px",borderRadius:8,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",color:"#EF4444",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>{loadingTargets?"…":"Load"}</button>
          </div>
          {!tradeTargets.length&&!loadingTargets&&<div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontSize:10}}>Load a team to select players</div>}
          <div style={{maxHeight:260,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {tradeTargets.map((p,i)=>{
              const sel=myOffer.theirPlayers.find(x=>x.id===p.id);
              return<div key={i} onClick={()=>setMyOffer(prev=>({...prev,result:null,theirPlayers:sel?prev.theirPlayers.filter(x=>x.id!==p.id):[...prev.theirPlayers,p]}))} style={{padding:"7px 10px",borderRadius:9,cursor:"pointer",border:`1px solid ${sel?"rgba(239,68,68,.4)":"rgba(255,255,255,.05)"}`,background:sel?"rgba(239,68,68,.09)":"transparent",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:sel?700:400,color:sel?"#EF4444":"#94A3B8"}}>{p.name}</span>
                <span style={{fontSize:9,color:"#475569"}}>{p.pos} {p.ovr} ${p.salary}M</span>
              </div>;
            })}
          </div>
          {myOffer.theirPlayers?.length>0&&<div style={{marginTop:6,fontSize:9,color:"#EF4444",fontFamily:"'Orbitron',sans-serif"}}>Receiving: {myOffer.theirPlayers.map(p=>p.name).join(", ")}</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>Cash retained:</div>
        <input type="number" step="1" min="0" max="15" value={myOffer.cashRetained||0} onChange={e=>setMyOffer(p=>({...p,cashRetained:parseInt(e.target.value)||0}))} style={{width:70,textAlign:"center"}}/>
        <div style={{fontSize:9,color:"#334155"}}>M</div>
      </div>
      <button onClick={onEvaluate} disabled={myOffer.loading} style={{width:"100%",padding:"12px",borderRadius:12,background:myOffer.loading?"rgba(255,255,255,.05)":`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,color:"#fff",marginBottom:12}}>
        {myOffer.loading?"🤔 Evaluating...":"⚖️ Evaluate Trade"}
      </button>
      {myOffer.result&&(
        <div style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,.04)",border:`1px solid ${myOffer.result.accepted?"rgba(34,197,94,.3)":"rgba(239,68,68,.25)"}`}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:myOffer.result.accepted?"#22C55E":"#EF4444"}}>{myOffer.result.accepted?"✅ ACCEPTED":"❌ REJECTED"}</div>
            <GradeChip grade={myOffer.result.myGrade}/>
            <span style={{fontSize:10,color:"#64748B"}}>{myOffer.result.verdict}</span>
          </div>
          <div style={{fontSize:11,color:"#94A3B8",marginBottom:6}}>{myOffer.result.analysis}</div>
          {!myOffer.result.accepted&&myOffer.result.counterSuggestion&&<div style={{fontSize:10,color:"#F59E0B",marginBottom:8}}>💡 {myOffer.result.counterSuggestion}</div>}
          {myOffer.result.accepted&&<button onClick={onExecute} style={{padding:"8px 16px",borderRadius:10,background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>✅ Execute Trade</button>}
        </div>
      )}
    </div>)}
    {subTab==="block"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:10}}>Players on the block signal availability to other teams and boost trade offer quality.</div>
      {roster.filter(Boolean).map((p,i)=>{
        const onBlock=tradeBlock.find(x=>x.id===p.id);
        return<div key={i} onClick={()=>onTradeBlock(p)} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:11,marginBottom:5,cursor:"pointer",border:`1px solid ${onBlock?"rgba(245,158,11,.4)":"rgba(255,255,255,.06)"}`,background:onBlock?"rgba(245,158,11,.08)":"rgba(255,255,255,.02)",alignItems:"center"}}>
          <div style={{flex:1}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:onBlock?"#F59E0B":"#94A3B8"}}>{p.name}</span><span style={{fontSize:9,color:"#475569",marginLeft:6}}>{p.pos} · TV:{playerTradeValue(p,sport)}</span></div>
          <OVRBadge ovr={p.ovr}/>
          {onBlock&&<span style={{fontSize:8,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>ON BLOCK</span>}
        </div>;
      })}
    </div>)}
    {subTab==="finder"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:14}}>Select a player you want to trade away. AI will suggest what teams would offer for them.</div>
      {roster.filter(Boolean).map((p,i)=>(
        <div key={i} onClick={async()=>{
          setMyOffer(prev=>({...prev,loading:true}));
          const r=await aiCall(`What would ${sport?.toUpperCase()} teams offer in trade for ${p.name} (${p.pos},OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.years}yr)? Return JSON array of 3 offers: [{team,theyOffer(array of {name,pos,ovr,salary}),picks,analysis,grade}]`);
          setMyOffer(prev=>({...prev,loading:false,result:{accepted:true,analysis:Array.isArray(r)?r.map(o=>`${o.team}: ${o.theyOffer?.map(x=>x.name).join(",")}${o.picks?.length?" + "+o.picks.join(","):""}  —  ${o.analysis}`).join(" | "):"AI error",verdict:"Trade finder results",myGrade:"?",theirGrade:"?"}}));
        }} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:11,marginBottom:5,cursor:"pointer",border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.02)",alignItems:"center"}}>
          <div style={{flex:1}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span><span style={{fontSize:9,color:"#475569",marginLeft:6}}>{p.pos} · TV:{playerTradeValue(p,sport)}</span></div>
          <OVRBadge ovr={p.ovr}/>
          <span style={{fontSize:9,color:"#475569"}}>Find offers →</span>
        </div>
      ))}
      {myOffer.loading&&<div style={{textAlign:"center",padding:"20px",color:"#475569",fontSize:12}}>Searching trade market…</div>}
      {myOffer.result?.verdict==="Trade finder results"&&<div style={{padding:"14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",fontSize:11,color:"#94A3B8",lineHeight:1.7}}>{myOffer.result.analysis}</div>}
    </div>)}
  </div>);
}

function FAStepV3({freeAgents,sport,ac,capInfo,auctions,myTeam,onBid,mob}){
  const[bidAmounts,setBidAmounts]=useState({});
  const[bidYears,setBidYears]=useState({});
  const[filter,setFilter]=useState("all");
  const positions=GM_POSITIONS[sport]||[];
  const filtered=freeAgents.filter(fa=>filter==="all"||fa.pos===filter);
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{fontSize:10,color:capInfo.space<0?"#EF4444":"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginRight:4}}>${capInfo.space.toFixed(1)}M space</div>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"5px 9px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
        <option value="all">All Positions</option>
        {positions.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
    </div>
    {filtered.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#334155",fontSize:12}}>No free agents available. Cut players to generate cap space or check back after transactions.</div>}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filtered.map((fa,i)=>{
        const auction=auctions[fa.id];
        const topBid=auction?.bidders?.length?Math.max(...auction.bidders.map(b=>b.offer)):0;
        const bidCount=auction?.bidders?.length||0;
        return(
          <div key={i} style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:`1px solid ${bidCount>1?"rgba(239,68,68,.2)":"rgba(255,255,255,.07)"}`}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:"#E2E8F0"}}>{fa.name}</span>
                  <span style={{fontSize:9,color:ac,fontFamily:"'Orbitron',sans-serif"}}>{fa.pos}</span>
                  {bidCount>1&&<span style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",padding:"1px 5px",borderRadius:5,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)"}}>{bidCount} teams bidding!</span>}
                  {(fa.traits||[]).map((t,j)=><span key={j} style={{fontSize:8,color:"#334155",padding:"1px 5px",borderRadius:4,background:"rgba(255,255,255,.04)"}}>{t}</span>)}
                </div>
                <div style={{fontSize:10,color:"#64748B"}}>Age {fa.age} · OVR {fa.ovr} · Pot {fa.potential} · Ask: ${fa.salary}M/yr · {fa.historicalComp||""}</div>
                {fa.note&&<div style={{fontSize:10,color:"#475569",marginTop:2}}>{fa.note}</div>}
              </div>
              <OVRBadge ovr={fa.ovr}/>
            </div>
            {auction?.bidders?.length>0&&(
              <div style={{marginBottom:8,padding:"6px 10px",borderRadius:8,background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.1)"}}>
                <div style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>COMPETING OFFERS</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{auction.bidders.map((b,j)=><span key={j} style={{fontSize:9,color:"#94A3B8"}}>{b.team}: ${b.offer.toFixed(1)}M/{b.years}yr</span>)}</div>
              </div>
            )}
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input type="number" step="0.5" min={fa.salary*0.7} max={fa.salary*3} value={bidAmounts[fa.id]||""} onChange={e=>setBidAmounts(p=>({...p,[fa.id]:e.target.value}))} placeholder={`$${fa.salary}M`} style={{width:85,textAlign:"center"}}/>
              <select value={bidYears[fa.id]||fa.years} onChange={e=>setBidYears(p=>({...p,[fa.id]:e.target.value}))} style={{width:65}}>
                {[1,2,3,4,5,6,7].map(y=><option key={y} value={y}>{y}yr</option>)}
              </select>
              <button onClick={()=>onBid(fa,parseFloat(bidAmounts[fa.id]||fa.salary),parseInt(bidYears[fa.id]||fa.years))} style={{padding:"7px 14px",borderRadius:10,background:ac+"22",border:`1px solid ${ac}44`,color:ac,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{topBid>0?"🔼 Outbid":"🖊 Sign"}</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>);
}

function DraftStepV3({draftBoard,picks,sport,ac,year,aiOffers,pickInventory,onLoadBoard,onDraft,onUndo,onTradePick,canPickTrade,mob}){
  const[filter,setFilter]=useState("all");
  const[viewScouting,setViewScouting]=useState(null);
  const[tradePickTarget,setTradePickTarget]=useState(null);
  const[tradePickTeam,setTradePickTeam]=useState("");
  useEffect(()=>{onLoadBoard();},[]);
  const positions=GM_POSITIONS[sport]||[];
  const filtered=draftBoard.filter(p=>filter==="all"||p.pos===filter);
  const myAvailPicks=pickInventory.filter(pk=>pk.owned&&!pk.traded);
  return(<div>
    {picks.length>0&&(
      <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:ac+"10",border:`1px solid ${ac}33`}}>
        <div style={{fontSize:9,color:ac,fontFamily:"'Orbitron',sans-serif",marginBottom:5}}>YOUR PICKS ({picks.length})</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{picks.map((p,i)=><span key={i} style={{padding:"3px 9px",borderRadius:9,background:ac+"20",border:`1px solid ${ac}44`,fontSize:10,color:ac,fontFamily:"'Orbitron',sans-serif"}}>{p.name} ({p.pos})</span>)}</div>
        {picks.length>0&&<button onClick={onUndo} style={{marginTop:6,padding:"3px 10px",borderRadius:7,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>↩ Undo Last Pick</button>}
      </div>
    )}
    {aiOffers.length>0&&(
      <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:"rgba(168,85,247,.07)",border:"1px solid rgba(168,85,247,.2)"}}>
        <div style={{fontSize:9,color:"#A855F7",fontFamily:"'Orbitron',sans-serif",marginBottom:5}}>🤖 AI PICK TRADE OFFERS</div>
        {aiOffers.map((o,i)=><div key={i} style={{fontSize:10,color:"#94A3B8",marginBottom:3}}>{o.fromTeam}: Give {o.offeredPick} → Get {o.askingPick}{o.plusPlayer?` + ${o.plusPlayer}`:""} — {o.analysis}</div>)}
      </div>
    )}
    {canPickTrade&&myAvailPicks.length>0&&(
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>MY PICKS — click to trade</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {myAvailPicks.map((pk,i)=>(
            <button key={i} onClick={()=>setTradePickTarget(pk===tradePickTarget?null:pk)} style={{padding:"5px 10px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${tradePickTarget?.id===pk.id?"rgba(245,158,11,.5)":"rgba(255,255,255,.1)"}`,background:tradePickTarget?.id===pk.id?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tradePickTarget?.id===pk.id?"#F59E0B":"#64748B"}}>{pk.label}</button>
          ))}
        </div>
        {tradePickTarget&&(
          <div style={{display:"flex",gap:6,marginTop:8,alignItems:"center"}}>
            <input value={tradePickTeam} onChange={e=>setTradePickTeam(e.target.value)} placeholder="Trade to (team name)…" style={{flex:1}}/>
            <button onClick={()=>{onTradePick(tradePickTarget,tradePickTeam);setTradePickTarget(null);setTradePickTeam("");}} disabled={!tradePickTeam.trim()} style={{padding:"6px 12px",borderRadius:9,background:"rgba(245,158,11,.12)",border:"1px solid rgba(245,158,11,.3)",color:"#F59E0B",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>Trade Pick</button>
          </div>
        )}
      </div>
    )}
    <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"5px 9px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
        <option value="all">All Positions</option>
        {positions.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
      <div style={{fontSize:10,color:"#334155",display:"flex",alignItems:"center",fontFamily:"'Orbitron',sans-serif"}}>{draftBoard.length} prospects</div>
    </div>
    {viewScouting&&(
      <div style={{marginBottom:12,padding:"14px",borderRadius:14,background:"rgba(0,212,255,.06)",border:"1px solid rgba(0,212,255,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#E2E8F0"}}>{viewScouting.name} <span style={{color:ac,fontSize:10}}>{viewScouting.pos}</span></div>
          <button onClick={()=>setViewScouting(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
          {[["CEIL",viewScouting.ceiling,"#22C55E"],["FLOOR",viewScouting.floor,"#F59E0B"],["ETA",viewScouting.eta+"yr","#00D4FF"],["TV",viewScouting.tradeValue,ac]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",padding:"8px",borderRadius:8,background:"rgba(255,255,255,.04)"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:8,color:"#334155"}}>{l}</div></div>
          ))}
        </div>
        <div style={{fontSize:11,color:"#94A3B8",lineHeight:1.6,marginBottom:5}}>{viewScouting.scoutingReport}</div>
        <div style={{display:"flex",gap:12,fontSize:10,color:"#475569"}}><span>Comp: {viewScouting.comparable||"—"}</span><span>School: {viewScouting.school}</span><span>Sign: {viewScouting.signability}</span></div>
      </div>
    )}
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {draftBoard.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#334155",fontSize:12}}>Loading draft board…</div>}
      {filtered.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",alignItems:"center"}}>
          <div style={{width:28,height:28,borderRadius:6,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:"#475569",flexShrink:0}}>#{p.pick||i+1}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span>
              <span style={{fontSize:9,color:ac}}>{p.pos}</span>
              <span style={{fontSize:9,color:"#475569"}}>{p.school}</span>
              <GradeChip grade={p.grade}/>
            </div>
            <div style={{fontSize:9,color:"#475569"}}>Ceil:{p.ceiling} · Floor:{p.floor} · ETA:{p.eta}yr · Comp:{p.comparable}</div>
          </div>
          <div style={{display:"flex",gap:4,flexShrink:0}}>
            <button onClick={()=>setViewScouting(p===viewScouting?null:p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",color:"#00D4FF",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>Scout</button>
            <button onClick={()=>onDraft(p)} style={{padding:"5px 10px",borderRadius:9,background:ac+"22",border:`1px solid ${ac}44`,color:ac,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>Draft</button>
          </div>
        </div>
      ))}
    </div>
  </div>);
}

function CommandStepV3({roster,setRoster,farmSystem,depthChart,setDepthChart,scheme,setScheme,sport,ac,myTeam,allMoves,capInfo,rules,rosterTab,setRosterTab,onCallUp,onSendDown,onIL,onActivate,budget,setBudget,ownerGoals,mob}){
  const[cmdTab,setCmdTab]=useState("roster");
  const slots=DEPTH_SLOTS[sport]||[];
  const schemes=SCHEMES[sport]||[];
  const findPlayer=(id)=>roster.find(p=>p.id===id);
  const ilPlayers=roster.filter(p=>p.il||p.status==="injured");
  const waiverPlayers=roster.filter(p=>p.waiverStatus==="on_waivers");
  const activeRoster=roster.filter(p=>p.status==="active"&&!p.il);
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
      {[["roster","👥 Roster"],["depth","📊 Depth Chart"],["farm","🌱 Farm System"],["budget","💼 Budget"],["scheme","🎮 Scheme"],["log","📋 Moves"]].map(([t,l])=>(
        <button key={t} onClick={()=>setCmdTab(t)} style={{padding:"6px 11px",borderRadius:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${cmdTab===t?ac+"55":"rgba(255,255,255,.08)"}`,background:cmdTab===t?ac+"14":"rgba(255,255,255,.02)",color:cmdTab===t?ac:"#475569"}}>{l}</button>
      ))}
    </div>
    {cmdTab==="roster"&&(<div>
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
        {[["active",`Active (${activeRoster.length}/${rules.active})`],["il",`IL (${ilPlayers.length})`],["waiver",`Waivers (${waiverPlayers.length})`]].map(([t,l])=>(
          <button key={t} onClick={()=>setRosterTab(t)} style={{padding:"4px 10px",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${rosterTab===t?ac+"44":"rgba(255,255,255,.07)"}`,background:rosterTab===t?ac+"10":"rgba(255,255,255,.02)",color:rosterTab===t?ac:"#475569"}}>{l}</button>
        ))}
      </div>
      {rosterTab==="active"&&activeRoster.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:4,alignItems:"center"}}>
          <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{fontSize:9,color:ac}}>{p.pos}</span></div><div style={{fontSize:9,color:"#475569"}}>${p.salary}M · {p.years}yr · Age {p.age}</div></div>
          <OVRBadge ovr={p.ovr}/>
          <div style={{display:"flex",gap:4}}>
            {rules.il10&&<button onClick={()=>onIL(p,"10")} style={{padding:"3px 7px",borderRadius:6,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",color:"#F59E0B",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>IL</button>}
            {sport==="mlb"&&<button onClick={()=>onSendDown(p)} style={{padding:"3px 7px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>⬇ AAA</button>}
          </div>
        </div>
      ))}
      {rosterTab==="il"&&(<div>
        {!ilPlayers.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No injured players</div>}
        {ilPlayers.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:11,background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.15)",marginBottom:4,alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{fontSize:9,color:"#EF4444"}}>{p.il}-day IL</span></div><div style={{fontSize:9,color:"#475569"}}>{p.pos} · Age {p.age}</div></div>
            <OVRBadge ovr={p.ovr}/>
            <button onClick={()=>onActivate(p)} style={{padding:"5px 10px",borderRadius:8,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>Activate</button>
          </div>
        ))}
      </div>)}
      {rosterTab==="waiver"&&(<div>
        {!waiverPlayers.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No players on waivers</div>}
        {waiverPlayers.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:11,background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.15)",marginBottom:4,alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div><div style={{fontSize:9,color:"#475569"}}>{p.pos} · ${p.salary}M</div></div>
            <OVRBadge ovr={p.ovr}/>
          </div>
        ))}
      </div>)}
    </div>)}
    {cmdTab==="depth"&&(<div>
      {slots.map(slot=>{
        const p=findPlayer(depthChart[slot]);
        return(<div key={slot} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:4}}>
          <div style={{minWidth:mob?50:70,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:ac}}>{slot}</div>
          <select value={depthChart[slot]||""} onChange={e=>setDepthChart(prev=>({...prev,[slot]:e.target.value||null}))} style={{flex:1,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",borderRadius:8,padding:"4px 8px",fontSize:11}}>
            <option value="">— Empty —</option>
            {roster.filter(Boolean).map(r=><option key={r.id} value={r.id}>{r.name} ({r.pos}) {r.ovr}</option>)}
          </select>
          {p&&<OVRBadge ovr={p.ovr}/>}
        </div>);
      })}
    </div>)}
    {cmdTab==="farm"&&(<div>
      {["AAA","AA","A","Rookie"].map(lvl=>{
        const players=(farmSystem[lvl]||[]);
        if(!players.length&&lvl==="Rookie")return null;
        return(<div key={lvl} style={{marginBottom:16}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:ac,marginBottom:8}}>{lvl} ({players.length} prospects)</div>
          {!players.length&&<div style={{fontSize:10,color:"#334155",padding:"10px 0"}}>No {lvl} prospects</div>}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:6}}>
            {players.filter(Boolean).map((p,i)=>(
              <div key={i} style={{padding:"10px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)",display:"flex",gap:8,alignItems:"center"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                  <div style={{fontSize:9,color:ac}}>{p.pos} · ETA: {p.eta||"?"}yr</div>
                  <div style={{fontSize:9,color:"#334155"}}>Age {p.age} · Ceil: {p.potential||p.ceiling}</div>
                </div>
                <OVRBadge ovr={p.ovr}/>
                {lvl==="AAA"&&(p.eta<=1||p.ovr>=72)&&(
                  <button onClick={()=>onCallUp(p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#22C55E",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>⬆ MLB</button>
                )}
              </div>
            ))}
          </div>
        </div>);
      })}
    </div>)}
    {cmdTab==="budget"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Adjust your front office budget. Higher scouting = better draft intel. Higher development = faster farm progression.</div>
      {[["payroll","Payroll Budget",200,50],["scouting","Scouting",10,50],["development","Player Development",5,40],["international","International",5,30]].map(([k,label,mn,mx])=>(
        <div key={k} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:10,color:"#94A3B8",fontFamily:"'Orbitron',sans-serif"}}>{label.toUpperCase()}</span>
            <span style={{fontSize:11,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>${budget[k]||mn}M</span>
          </div>
          <input type="range" min={mn} max={mx} value={budget[k]||mn} onChange={e=>setBudget(prev=>({...prev,[k]:parseInt(e.target.value)}))} style={{width:"100%",accentColor:ac}}/>
        </div>
      ))}
      <div style={{padding:"12px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",marginTop:8}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>OWNER GOALS</div>
        {(ownerGoals||[]).map((g,i)=><div key={i} style={{fontSize:11,color:"#22C55E",padding:"3px 0"}}>✓ {g}</div>)}
        {!ownerGoals?.length&&<div style={{fontSize:10,color:"#334155"}}>No goals set yet</div>}
      </div>
    </div>)}
    {cmdTab==="scheme"&&(<div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:12}}>TEAM SCHEME</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {schemes.map(s=>(
          <button key={s} onClick={()=>setScheme(s)} style={{padding:"10px 18px",borderRadius:12,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,border:`2px solid ${scheme===s?ac+"88":"rgba(255,255,255,.1)"}`,background:scheme===s?ac+"18":"rgba(255,255,255,.03)",color:scheme===s?ac:"#64748B"}}>{s}</button>
        ))}
      </div>
    </div>)}
    {cmdTab==="log"&&(<div>
      {!allMoves.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:12}}>No moves made yet</div>}
      {allMoves.map((m,i)=>(
        <div key={i} style={{padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)",fontSize:11,color:"#94A3B8",marginBottom:4}}>{m.msg}<span style={{float:"right",fontSize:9,color:"#334155"}}>{new Date(m.ts).toLocaleTimeString()}</span></div>
      ))}
    </div>)}
  </div>);
}

function ReviewStepV3({roster,allMoves,myDraftPicks,grade,sport,ac,year,season,simHistory,farmSystem,capInfo,ownerGoals,onGrade,onSimulate,simProgress,mob}){
  const active=roster.filter(p=>p.status==="active"&&!p.il);
  const teamOvr=Math.round(active.reduce((s,p)=>s+p.ovr,0)/Math.max(1,active.length));
  const farmCount=Object.values(farmSystem).flat().length;
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {[[teamOvr,"TEAM OVR",ac],[allMoves.length,"MOVES",ac],[myDraftPicks.length,"DRAFTED",ac],[farmCount,"FARM",ac]].map(([v,l,c])=>(
        <div key={l} style={{textAlign:"center",padding:"14px",borderRadius:14,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,fontWeight:900,color:c}}>{v}</div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{l}</div>
        </div>
      ))}
    </div>
    {/* Owner goals */}
    {ownerGoals?.length>0&&(
      <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>OWNER GOALS</div>
        {ownerGoals.map((g,i)=><div key={i} style={{fontSize:11,color:"#22C55E"}}>• {g}</div>)}
      </div>
    )}
    {/* Season history */}
    {simHistory.length>0&&(
      <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>FRANCHISE HISTORY</div>
        {simHistory.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#64748B"}}>{s.year}</span><span style={{color:"#E2E8F0",fontWeight:700}}>{s.record}</span><span style={{color:s.madePlayoffs?"#22C55E":"#475569",fontSize:10}}>{s.result}</span></div>)}
      </div>
    )}
    {/* Grade */}
    {grade&&(
      <div style={{marginBottom:14,padding:"16px",borderRadius:14,background:grade.grade?.startsWith("A")?"rgba(34,197,94,.08)":grade.grade?.startsWith("B")?"rgba(245,158,11,.08)":"rgba(239,68,68,.07)",border:`1px solid ${grade.grade?.startsWith("A")?"rgba(34,197,94,.25)":grade.grade?.startsWith("B")?"rgba(245,158,11,.25)":"rgba(239,68,68,.2)"}`}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:40,fontWeight:900,color:grade.grade?.startsWith("A")?"#22C55E":grade.grade?.startsWith("B")?"#F59E0B":"#EF4444"}}>{grade.grade}</div>
          <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{grade.headline}</div><div style={{fontSize:10,color:"#64748B"}}>{grade.franchiseTrajectory}</div></div>
        </div>
        <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.6,marginBottom:8}}>{grade.analysis}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><div style={{fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>✅ STRENGTHS</div>{grade.strengths?.map((s,i)=><div key={i} style={{fontSize:10,color:"#94A3B8"}}>· {s}</div>)}</div>
          <div><div style={{fontSize:9,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>⚠️ WEAKNESSES</div>{grade.weaknesses?.map((s,i)=><div key={i} style={{fontSize:10,color:"#94A3B8"}}>· {s}</div>)}</div>
        </div>
      </div>
    )}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {!grade&&<button onClick={onGrade} style={{padding:"12px",borderRadius:12,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#A855F7"}}>🤖 Grade My Offseason</button>}
      <button onClick={onSimulate} style={{padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#fff"}}>▶ SIMULATE {year} SEASON{season>1?` (Year ${season})`:""}  →</button>
    </div>
  </div>);
}



// ─── TRIVIA ───────────────────────────────────────────────────────────────────────
// ─── TRIVIA ───────────────────────────────────────────────────────────────────────
const TRIVIA_Q={
  mlb:{
    easy:[
      {q:"Who won the 2023 AL MVP award?",a:"Shohei Ohtani",w:["Aaron Judge","Freddie Freeman","Shohei Ohtani","Yordan Alvarez"]},
      {q:"Which team won the 2023 World Series?",a:"Texas Rangers",w:["Arizona Diamondbacks","Texas Rangers","Houston Astros","Atlanta Braves"]},
      {q:"Who hit 62 home runs in 2022 to break the AL record?",a:"Aaron Judge",w:["Aaron Judge","Pete Alonso","Kyle Schwarber","Yordan Alvarez"]},
      {q:"Who won the 2022 NL Cy Young Award?",a:"Sandy Alcantara",w:["Corbin Burnes","Sandy Alcantara","Max Scherzer","Spencer Strider"]},
      {q:"Which team did Shohei Ohtani sign with before the 2024 season?",a:"Los Angeles Dodgers",w:["San Francisco Giants","Los Angeles Dodgers","New York Yankees","Toronto Blue Jays"]},
      {q:"Who won the 2021 World Series?",a:"Atlanta Braves",w:["Houston Astros","Atlanta Braves","Tampa Bay Rays","Los Angeles Dodgers"]},
      {q:"Who won the 2019 AL MVP?",a:"Mike Trout",w:["Alex Bregman","Mike Trout","George Springer","Jose Abreu"]},
      {q:"What team did Freddie Freeman win the 2020 NL MVP with?",a:"Atlanta Braves",w:["Los Angeles Dodgers","Atlanta Braves","Washington Nationals","New York Mets"]},
      {q:"Who won the 2022 World Series?",a:"Houston Astros",w:["Philadelphia Phillies","Houston Astros","Atlanta Braves","New York Yankees"]},
      {q:"Which pitcher won the 2023 AL Cy Young?",a:"Gerrit Cole",w:["Dylan Cease","Gerrit Cole","Kevin Gausman","Luis Castillo"]},
      {q:"Who holds the record for most career stolen bases?",a:"Rickey Henderson (1,406)",w:["Tim Raines (808)","Vince Coleman (752)","Lou Brock (938)","Rickey Henderson (1,406)"]},
      {q:"Who won the 2020 World Series?",a:"Los Angeles Dodgers",w:["Tampa Bay Rays","Los Angeles Dodgers","Houston Astros","Atlanta Braves"]},
      {q:"Which player won the NL MVP in both 2021 and 2023?",a:"Bryce Harper / Freddie Freeman",w:["Bryce Harper / Freddie Freeman","Juan Soto","Paul Goldschmidt","Mookie Betts"]},
      {q:"Who won the 2023 NL MVP?",a:"Ronald Acuña Jr.",w:["Mookie Betts","Freddie Freeman","Ronald Acuña Jr.","Matt Olson"]},
      {q:"Shohei Ohtani won the 2021 AL MVP unanimously. How many first-place votes did he receive?",a:"30 (unanimous)",w:["28","30 (unanimous)","25","All but 2"]},
      {q:"Who won the 2018 NL Cy Young Award?",a:"Jacob deGrom",w:["Max Scherzer","Patrick Corbin","Aaron Nola","Jacob deGrom"]},
      {q:"Which team won back-to-back World Series in 2017 and 2018?",a:"No team — Houston won 2017, Boston won 2018",w:["Houston Astros","Los Angeles Dodgers","No team — Houston won 2017, Boston won 2018","Boston Red Sox"]},
      {q:"Who led the NL in batting average in 2023?",a:"Luis Arraez (.354)",w:["Freddie Freeman","Luis Arraez (.354)","Mookie Betts","Matt Olson"]},
      {q:"Which team did Pete Alonso win the 2019 Home Run Derby with?",a:"New York Mets",w:["New York Yankees","New York Mets","Los Angeles Dodgers","Chicago Cubs"]},
      {q:"Who won the 2019 World Series MVP?",a:"Stephen Strasburg",w:["Anthony Rendon","Stephen Strasburg","Howie Kendrick","Max Scherzer"]},
    ],
    medium:[
      {q:"Jacob deGrom won back-to-back NL Cy Young Awards. Which years?",a:"2018 and 2019",w:["2017 and 2018","2018 and 2019","2019 and 2020","2020 and 2021"]},
      {q:"Who was the only player to win MVP in both leagues?",a:"Frank Robinson",w:["Barry Bonds","Frank Robinson","Roger Clemens","Hank Aaron"]},
      {q:"Which pitcher had a 1.70 ERA over 2018–2019 combined, the lowest in modern history for a starter?",a:"Jacob deGrom",w:["Max Scherzer","Clayton Kershaw","Jacob deGrom","Justin Verlander"]},
      {q:"Who won the 2011 AL MVP with 45 HRs, 111 RBI while playing for the Tigers?",a:"Justin Verlander",w:["Jose Bautista","Adrian Beltre","Justin Verlander","Curtis Granderson"]},
      {q:"Barry Bonds set the single-season OPS record in 2004. What was it?",a:"1.421",w:["1.298","1.350","1.421","1.381"]},
      {q:"Which team won three consecutive World Series titles from 2000–2002?",a:"No team — Yankees won 2000, D-backs 2001, Angels 2002",w:["New York Yankees","No team — Yankees won 2000, D-backs 2001, Angels 2002","Atlanta Braves","Boston Red Sox"]},
      {q:"Who hit .406 in 1941, the last player to hit .400 in a season?",a:"Ted Williams",w:["Joe DiMaggio","Ted Williams","Stan Musial","Mickey Mantle"]},
      {q:"What was Mike Trout's WAR in 2012, considered one of the highest rookie seasons ever?",a:"10.9",w:["8.7","9.4","10.9","7.6"]},
      {q:"Who won the 2016 NL MVP with the Cubs?",a:"Kris Bryant",w:["Anthony Rizzo","Jon Lester","Kris Bryant","Jake Arrieta"]},
      {q:"Which closer set the all-time saves record with 652?",a:"Mariano Rivera",w:["Trevor Hoffman","Billy Wagner","Mariano Rivera","Lee Smith"]},
      {q:"Who threw a perfect game on May 29, 2010 only to have it controversially called off on the final out?",a:"Armando Galarraga",w:["Dallas Braden","Roy Halladay","Armando Galarraga","Ubaldo Jimenez"]},
      {q:"Which hitter led the AL in OPS+ for 7 consecutive seasons from 2012–2018?",a:"Mike Trout",w:["Miguel Cabrera","Mike Trout","Jose Altuve","Mookie Betts"]},
      {q:"Who was the 2013 AL Cy Young winner with a 24-5 record?",a:"Max Scherzer",w:["Felix Hernandez","Max Scherzer","Hisashi Iwakuma","Justin Verlander"]},
      {q:"How many consecutive Gold Glove Awards did Yadier Molina win at catcher?",a:"9",w:["6","8","9","13"]},
      {q:"Which team did Clayton Kershaw win his 2014 NL MVP AND Cy Young with?",a:"Los Angeles Dodgers",w:["Atlanta Braves","San Francisco Giants","Los Angeles Dodgers","Cincinnati Reds"]},
      {q:"Who led MLB in WAR in 2019 with a mark of 8.3?",a:"Cody Bellinger",w:["Christian Yelich","Mike Trout","Cody Bellinger","Freddie Freeman"]},
      {q:"In 2001, who hit .350 with 73 HRs and 137 RBI, winning the NL MVP?",a:"Barry Bonds",w:["Barry Bonds","Sammy Sosa","Luis Gonzalez","Jeff Bagwell"]},
      {q:"What is the MLB record for strikeouts in a single season by a pitcher?",a:"383 (Nolan Ryan, 1973)",w:["341 (Randy Johnson)","368 (Sandy Koufax)","382 (Steve Carlton)","383 (Nolan Ryan, 1973)"]},
      {q:"Which team lost the 2017 World Series but was later revealed to have been sign-stealing?",a:"Houston Astros (won it, controversy arose after)",w:["Houston Astros (won it, controversy arose after)","Los Angeles Dodgers","New York Yankees","Boston Red Sox"]},
      {q:"Who won the 2014 AL MVP with the Tigers, the last first baseman to win it?",a:"Miguel Cabrera",w:["Mike Trout","Miguel Cabrera","Nelson Cruz","Victor Martinez"]},
    ],
    hard:[
      {q:"Ichiro set the single-season hits record in 2004 with how many hits?",a:"262",w:["255","258","262","271"]},
      {q:"Who had the highest single-season fWAR since integration, recording 12.6 in 2012?",a:"Mike Trout",w:["Barry Bonds (2002)","Mike Trout","Willie Mays (1962)","Babe Ruth (1923)"]},
      {q:"Which pitcher won the NL Cy Young in 2020 despite only pitching 73 innings?",a:"Trevor Bauer",w:["Yu Darvish","Jacob deGrom","Trevor Bauer","Dinelson Lamet"]},
      {q:"What team did the 2019 Astros' sign-stealing scheme most directly affect in the playoffs?",a:"All opponents, most notably the Yankees and Dodgers",w:["Boston Red Sox","All opponents, most notably the Yankees and Dodgers","Tampa Bay Rays","New York Yankees"]},
      {q:"Who led MLB in bWAR in BOTH 2013 and 2014?",a:"Mike Trout",w:["Miguel Cabrera","Clayton Kershaw","Mike Trout","Andrew McCutchen"]},
      {q:"Which team's 2018 sign-stealing investigation also resulted in a manager firing?",a:"Boston Red Sox (Alex Cora fired)",w:["Houston Astros","Boston Red Sox (Alex Cora fired)","New York Mets","Los Angeles Dodgers"]},
      {q:"What was Felix Hernandez's ERA in 2010 when he won the AL Cy Young with only 13 wins?",a:"2.27",w:["2.43","2.61","2.27","1.98"]},
      {q:"Who had the highest single-season OBP since 1950 with .609 in 2004?",a:"Barry Bonds",w:["Ted Williams","Babe Ruth","Barry Bonds","Mickey Mantle"]},
      {q:"Which pitcher holds the record for most no-hitters thrown in a career?",a:"Nolan Ryan (7)",w:["Sandy Koufax (4)","Bob Feller (3)","Nolan Ryan (7)","Randy Johnson (2)"]},
      {q:"In what year did the Houston Astros go from worst to first, winning 86 games after losing 111?",a:"2015",w:["2013","2014","2015","2016"]},
      {q:"What was Zack Greinke's ERA in 2009 when he won the AL Cy Young?",a:"2.16",w:["2.33","1.99","2.16","2.48"]},
      {q:"Who hit .372 in 1994 — the year the season was cut short by a strike — to potentially threaten .400?",a:"Tony Gwynn",w:["Frank Thomas","Tony Gwynn","Jeff Bagwell","Matt Williams"]},
      {q:"Which player was intentionally walked 120 times in a single season?",a:"Barry Bonds (2004)",w:["Babe Ruth (1923)","Ted Williams (1957)","Barry Bonds (2004)","Mickey Mantle (1961)"]},
      {q:"How many consecutive scoreless innings did Orel Hershiser throw in 1988, setting the MLB record?",a:"59",w:["52","55","59","63"]},
      {q:"Who won the 2012 AL MVP, the last player other than Trout or Ohtani to win it until 2024?",a:"Miguel Cabrera (Triple Crown season)",w:["Josh Hamilton","Miguel Cabrera (Triple Crown season)","Mike Trout","Robinson Cano"]},
    ],
  },
  nfl:{
    easy:[
      {q:"Who won the 2023 NFL MVP award?",a:"Lamar Jackson",w:["Patrick Mahomes","Josh Allen","Lamar Jackson","CJ Stroud"]},
      {q:"Which team won Super Bowl LVIII (58) in 2024?",a:"Kansas City Chiefs",w:["San Francisco 49ers","Kansas City Chiefs","Baltimore Ravens","Detroit Lions"]},
      {q:"Who won the Super Bowl MVP in Super Bowl LVIII?",a:"Patrick Mahomes",w:["Travis Kelce","Patrick Mahomes","Mecole Hardman","Chris Jones"]},
      {q:"How many MVP awards has Lamar Jackson won as of 2024?",a:"2 (2019 and 2023)",w:["1","2 (2019 and 2023)","3","He's never won MVP"]},
      {q:"Who won the 2022 NFL MVP?",a:"Patrick Mahomes",w:["Josh Allen","Justin Jefferson","Patrick Mahomes","Jalen Hurts"]},
      {q:"Which team won Super Bowl LVII (57)?",a:"Kansas City Chiefs",w:["Philadelphia Eagles","Kansas City Chiefs","San Francisco 49ers","Cincinnati Bengals"]},
      {q:"Who won the 2021 NFL MVP?",a:"Cooper Kupp (Offensive Player) / Aaron Rodgers (MVP)",w:["Josh Allen","Tom Brady","Cooper Kupp (Offensive Player) / Aaron Rodgers (MVP)","Dak Prescott"]},
      {q:"Who won back-to-back NFL MVP awards in 2020 and 2021?",a:"Aaron Rodgers",w:["Patrick Mahomes","Tom Brady","Aaron Rodgers","Josh Allen"]},
      {q:"Which team won Super Bowl LV (55) defeating the Chiefs 31-9?",a:"Tampa Bay Buccaneers",w:["Kansas City Chiefs","Tampa Bay Buccaneers","Green Bay Packers","Buffalo Bills"]},
      {q:"Who was the Super Bowl LV MVP?",a:"Tom Brady",w:["Rob Gronkowski","Tom Brady","Chris Godwin","Antonio Brown"]},
      {q:"How many total Super Bowls has Patrick Mahomes won as of 2024?",a:"3",w:["2","3","4","1"]},
      {q:"Who won the 2018 NFL MVP?",a:"Patrick Mahomes",w:["Drew Brees","Patrick Mahomes","Todd Gurley","Saquon Barkley"]},
      {q:"Which team did Tom Brady win his 7th Super Bowl with?",a:"Tampa Bay Buccaneers",w:["New England Patriots","Tampa Bay Buccaneers","Los Angeles Rams","Kansas City Chiefs"]},
      {q:"Who won the 2019 NFL MVP?",a:"Lamar Jackson",w:["Patrick Mahomes","Lamar Jackson","Russell Wilson","Deshaun Watson"]},
      {q:"Which running back won the 2018 NFL Offensive Rookie of the Year?",a:"Saquon Barkley",w:["Nick Chubb","Saquon Barkley","Phillip Lindsay","Sony Michel"]},
      {q:"Who led the NFL in receiving yards in 2022?",a:"Justin Jefferson",w:["Davante Adams","Tyreek Hill","Justin Jefferson","Stefon Diggs"]},
      {q:"Which team won Super Bowl LVI (56)?",a:"Los Angeles Rams",w:["Cincinnati Bengals","Los Angeles Rams","San Francisco 49ers","Las Vegas Raiders"]},
      {q:"Who was the Super Bowl LVI MVP?",a:"Cooper Kupp",w:["Matthew Stafford","Aaron Donald","Cooper Kupp","Odell Beckham Jr."]},
      {q:"How many passing TDs did Patrick Mahomes throw in his MVP 2018 season?",a:"50",w:["43","46","50","54"]},
      {q:"Which defensive player won the 2023 NFL Defensive Player of the Year?",a:"Myles Garrett",w:["Micah Parsons","Myles Garrett","Maxx Crosby","Fred Warner"]},
    ],
    medium:[
      {q:"Lamar Jackson's 2019 MVP season — how many passing TDs did he throw?",a:"36",w:["31","34","36","41"]},
      {q:"Who won the NFL MVP in 2017 with 4,577 yards and 34 TDs for the Eagles?",a:"Carson Wentz (but lost it to Tom Brady due to injury)",w:["Carson Wentz (but lost it to Tom Brady due to injury)","Nick Foles","Tom Brady","Drew Brees"]},
      {q:"Which QB set the NFL single-season completion percentage record of 74.3% in 2018?",a:"Drew Brees",w:["Aaron Rodgers","Patrick Mahomes","Drew Brees","Nick Foles"]},
      {q:"Who won the AP NFL MVP in 2012, his third in four years?",a:"Adrian Peterson",w:["Peyton Manning","Tom Brady","Adrian Peterson","Aaron Rodgers"]},
      {q:"What was Peyton Manning's single-season TD record set in 2013?",a:"55",w:["50","52","55","57"]},
      {q:"Who won the 2016 NFL MVP despite the Falcons going 11-5?",a:"Matt Ryan",w:["Dak Prescott","Matt Ryan","Ezekiel Elliott","Drew Brees"]},
      {q:"Which receiver set the NFL record for receiving yards in a season in 2012?",a:"Calvin Johnson (1,964 yards)",w:["Jerry Rice (1,848)","Julio Jones (1,964)","Calvin Johnson (1,964 yards)","Randy Moss (1,782)"]},
      {q:"Who rushed for 2,097 yards in 2012, second-most in NFL history?",a:"Adrian Peterson",w:["Jamaal Charles","LeSean McCoy","Adrian Peterson","Marshawn Lynch"]},
      {q:"Which team's defense allowed the fewest points in 2023, earning the #1 seed?",a:"San Francisco 49ers",w:["Baltimore Ravens","Dallas Cowboys","San Francisco 49ers","Cleveland Browns"]},
      {q:"Who won the 2015 NFL MVP, his second, leading the Panthers to a 15-1 record?",a:"Cam Newton",w:["Tom Brady","Cam Newton","Russell Wilson","Aaron Rodgers"]},
      {q:"What yards-per-carry did Derrick Henry average in his 2,000-yard 2020 season?",a:"5.4",w:["4.8","5.1","5.4","5.9"]},
      {q:"Which QB was the only unanimous NFL MVP in history (2024 ballot)?",a:"No one — there has been no unanimous MVP",w:["Lamar Jackson","Patrick Mahomes","No one — there has been no unanimous MVP","Aaron Rodgers"]},
      {q:"Who holds the record for most rushing TDs in a season with 28 in 1945?",a:"Steve Van Buren",w:["LaDainian Tomlinson (28 in 2006)","Emmitt Smith","Steve Van Buren","Jim Brown"]},
      {q:"Which team did Peyton Manning win his 5th MVP with in 2013?",a:"Denver Broncos",w:["Indianapolis Colts","Denver Broncos","Tennessee Titans","New Orleans Saints"]},
      {q:"Who was the last running back to win the NFL MVP before LaDainian Tomlinson in 2006?",a:"Marshall Faulk (2000)",w:["Emmitt Smith (1995)","Marshall Faulk (2000)","Barry Sanders (1997)","Jamal Lewis (2003)"]},
      {q:"How many interceptions did Lamar Jackson throw in his unanimous-style 2019 MVP season?",a:"6",w:["3","6","9","12"]},
      {q:"Which team did Kurt Warner win his second NFL MVP with in 2001?",a:"St. Louis Rams",w:["Arizona Cardinals","St. Louis Rams","New York Giants","Green Bay Packers"]},
      {q:"Justin Jefferson set the record for receiving yards in a player's first two NFL seasons. How many?",a:"3,016",w:["2,841","2,974","3,016","3,125"]},
      {q:"Who won the Super Bowl LI MVP after the greatest comeback in Super Bowl history?",a:"Tom Brady",w:["James White","Julian Edelman","Tom Brady","Malcolm Butler"]},
      {q:"How many straight 4,000-yard passing seasons did Drew Brees have from 2006–2018?",a:"13",w:["9","11","13","14"]},
    ],
    hard:[
      {q:"Lamar Jackson's 2019 MVP season passer rating was the highest single-season mark ever at the time. What was it?",a:"113.3",w:["109.7","111.4","113.3","116.1"]},
      {q:"Who was the only player to win the NFL MVP, Super Bowl MVP, and be cut the next season?",a:"Joe Theismann (not exactly) — trick Q. Answer: no such player exists",w:["Jim Plunkett","Joe Theismann (not exactly) — trick Q. Answer: no such player exists","Doug Williams","Phil Simms"]},
      {q:"Patrick Mahomes' 2018 MVP season: what was his adjusted net yards per attempt?",a:"9.6",w:["8.7","9.1","9.6","10.2"]},
      {q:"Which QB has the highest career passer rating in NFL history (minimum 1,500 attempts)?",a:"Patrick Mahomes (106.3 entering 2024)",w:["Aaron Rodgers (103.1)","Tom Brady (97.6)","Patrick Mahomes (106.3 entering 2024)","Tony Romo (97.6)"]},
      {q:"Who led the NFL in EPA (Expected Points Added) per dropback in 2023?",a:"Dak Prescott",w:["Josh Allen","Tua Tagovailoa","Dak Prescott","Brock Purdy"]},
      {q:"What was Peyton Manning's TD:INT ratio in his 55-TD 2013 season?",a:"55:10",w:["55:7","55:10","55:12","55:8"]},
      {q:"Which team went 14-3 in the 2023 regular season but lost in the NFC Championship?",a:"San Francisco 49ers",w:["Detroit Lions","Philadelphia Eagles","San Francisco 49ers","Dallas Cowboys"]},
      {q:"Who holds the NFL record for most receiving yards in a single game?",a:"Flipper Anderson (336 yards, 1989)",w:["Jerry Rice (289)","Calvin Johnson (329)","Flipper Anderson (336 yards, 1989)","Colt Anderson (303)"]},
      {q:"Aaron Rodgers' 2011 season had the highest single-season passer rating at the time. What was it?",a:"122.5",w:["118.6","120.3","122.5","124.8"]},
      {q:"Which team holds the record for most points scored in a single Super Bowl?",a:"San Francisco 49ers (55 points, Super Bowl XXIX)",w:["Chicago Bears (46, Super Bowl XX)","San Francisco 49ers (55 points, Super Bowl XXIX)","Dallas Cowboys (52, Super Bowl XXVII)","New England Patriots (48, Super Bowl XXXIX)"]},
      {q:"How many NFL MVP awards has Aaron Rodgers won?",a:"4 (2011, 2014, 2020, 2021)",w:["3","4 (2011, 2014, 2020, 2021)","2","5"]},
      {q:"Who set the record for most tackles for loss in a single season with 23 in 2019?",a:"Myles Garrett",w:["Aaron Donald","Myles Garrett","Chase Young","Joey Bosa"]},
      {q:"Which QB threw 40 TDs and only 4 INTs in 2018, with a historically low interception rate?",a:"Drew Brees",w:["Patrick Mahomes","Drew Brees","Aaron Rodgers","Matt Ryan"]},
      {q:"What record did Justin Jefferson break in 2022 to become the fastest to 5,000 career receiving yards?",a:"Odell Beckham Jr.'s record",w:["Randy Moss's record","Odell Beckham Jr.'s record","Jerry Rice's record","Marvin Harrison's record"]},
      {q:"Who was the defensive MVP of Super Bowl XLVIII, a 43-8 Seattle blowout of Denver?",a:"Malcolm Smith",w:["Earl Thomas","Richard Sherman","Malcolm Smith","Bobby Wagner"]},
    ],
  },
  nba:{
    easy:[
      {q:"Who won the 2023 NBA MVP?",a:"Joel Embiid",w:["Nikola Jokic","Joel Embiid","Jayson Tatum","Luka Doncic"]},
      {q:"How many consecutive NBA MVPs did Nikola Jokic win before Embiid in 2023?",a:"2 (2021 and 2022)",w:["1","2 (2021 and 2022)","3","He won 3 straight"]},
      {q:"Which team won the 2023 NBA Championship?",a:"Denver Nuggets",w:["Miami Heat","Denver Nuggets","Boston Celtics","Golden State Warriors"]},
      {q:"Who was the 2023 NBA Finals MVP?",a:"Nikola Jokic",w:["Jamal Murray","Nikola Jokic","Jaylen Brown","Jimmy Butler"]},
      {q:"Which team won the 2022 NBA Championship?",a:"Golden State Warriors",w:["Boston Celtics","Golden State Warriors","Miami Heat","Memphis Grizzlies"]},
      {q:"Who won the 2022 NBA Finals MVP?",a:"Stephen Curry",w:["Klay Thompson","Draymond Green","Stephen Curry","Andrew Wiggins"]},
      {q:"LeBron James passed Kareem Abdul-Jabbar as the all-time scoring leader in what year?",a:"2023",w:["2021","2022","2023","2024"]},
      {q:"Who won the 2021 NBA MVP?",a:"Nikola Jokic",w:["Giannis Antetokounmpo","Stephen Curry","Nikola Jokic","Luka Doncic"]},
      {q:"Who won the 2021 NBA Championship?",a:"Milwaukee Bucks",w:["Phoenix Suns","Atlanta Hawks","Milwaukee Bucks","Los Angeles Clippers"]},
      {q:"Who was the 2021 NBA Finals MVP?",a:"Giannis Antetokounmpo",w:["Khris Middleton","Jrue Holiday","Giannis Antetokounmpo","Brook Lopez"]},
      {q:"Giannis Antetokounmpo won back-to-back MVPs in which years?",a:"2019 and 2020",w:["2018 and 2019","2019 and 2020","2020 and 2021","2021 and 2022"]},
      {q:"Who won the 2024 NBA MVP?",a:"Nikola Jokic",w:["Luka Doncic","Shai Gilgeous-Alexander","Nikola Jokic","Jayson Tatum"]},
      {q:"Which team did LeBron James win his first NBA championship with?",a:"Miami Heat",w:["Cleveland Cavaliers","Miami Heat","Los Angeles Lakers","Boston Celtics"]},
      {q:"Who won the 2020 NBA MVP?",a:"Giannis Antetokounmpo",w:["LeBron James","James Harden","Giannis Antetokounmpo","Kawhi Leonard"]},
      {q:"Which team won the 2024 NBA Championship?",a:"Boston Celtics",w:["Dallas Mavericks","Boston Celtics","Indiana Pacers","New York Knicks"]},
      {q:"Who was the 2018 NBA Finals MVP playing for Golden State?",a:"Kevin Durant",w:["Stephen Curry","Klay Thompson","Kevin Durant","Draymond Green"]},
      {q:"Stephen Curry set the NBA 3-point record in 2015-16 with how many makes?",a:"402",w:["339","371","402","418"]},
      {q:"Who won the 2019 NBA Finals MVP?",a:"Kawhi Leonard",w:["Kyle Lowry","Pascal Siakam","Kawhi Leonard","Marc Gasol"]},
      {q:"Which team won the 2019 NBA Championship?",a:"Toronto Raptors",w:["Golden State Warriors","Toronto Raptors","Milwaukee Bucks","Portland Trail Blazers"]},
      {q:"Who won the 2016 NBA MVP?",a:"Stephen Curry (unanimous)",w:["LeBron James","Kevin Durant","Stephen Curry (unanimous)","Kawhi Leonard"]},
    ],
    medium:[
      {q:"Nikola Jokic's 2021 MVP season — what was his stat line (PPG/RPG/APG)?",a:"26.4 / 10.8 / 8.3",w:["24.2 / 9.7 / 7.1","26.4 / 10.8 / 8.3","28.1 / 11.2 / 7.9","23.6 / 10.2 / 8.9"]},
      {q:"Which player became the first center to win MVP since Shaquille O'Neal (2000) until Jokic?",a:"Nikola Jokic was the first since Shaq",w:["Dwight Howard","Joel Embiid","Nikola Jokic was the first since Shaq","Karl-Anthony Towns"]},
      {q:"Stephen Curry's unanimous 2016 MVP season: what was his PPG?",a:"30.1",w:["27.8","29.4","30.1","32.3"]},
      {q:"Who holds the NBA record for most points in a playoff series?",a:"Michael Jordan (though Wilt held single-game records)",w:["Michael Jordan (though Wilt held single-game records)","LeBron James","Kobe Bryant","Jerry West"]},
      {q:"Which player averaged 36.3 PPG in the 2007 playoffs, the highest since Michael Jordan?",a:"LeBron James",w:["Dwyane Wade","Kobe Bryant","LeBron James","Dirk Nowitzki"]},
      {q:"Who won the NBA MVP in 2014 with OKC, averaging 32.0 PPG?",a:"Kevin Durant",w:["LeBron James","Kevin Durant","Russell Westbrook","James Harden"]},
      {q:"Russell Westbrook averaged a triple-double for the full season in 2016-17. What was his APG?",a:"10.4",w:["9.1","10.4","11.2","12.0"]},
      {q:"Which player won the MVP in 2018 with the most Win Shares in the league despite playing for the Rockets?",a:"James Harden",w:["LeBron James","James Harden","Steph Curry","Anthony Davis"]},
      {q:"Who led the NBA in scoring in 2023-24 with 34.3 PPG?",a:"Luka Doncic",w:["Shai Gilgeous-Alexander","Jayson Tatum","Luka Doncic","Damian Lillard"]},
      {q:"Which team set the NBA record for wins in a season with 73 in 2015-16?",a:"Golden State Warriors",w:["Chicago Bulls (72-10)","Golden State Warriors","San Antonio Spurs","Cleveland Cavaliers"]},
      {q:"Giannis Antetokounmpo's 2019-20 MVP season: what was his PER?",a:"31.9",w:["28.7","30.4","31.9","33.2"]},
      {q:"Who won the Defensive Player of the Year AND MVP in the same season (2020)?",a:"Giannis Antetokounmpo",w:["Kawhi Leonard","Ben Simmons","Giannis Antetokounmpo","Rudy Gobert"]},
      {q:"Joel Embiid's 2022-23 MVP season had what PPG, highest by an MVP since Jordan?",a:"33.1",w:["30.6","31.8","33.1","34.7"]},
      {q:"Which player averaged 29/8/8 in the 2023 Finals to win MVP despite his team losing?",a:"No player wins Finals MVP on the losing team — Jimmy Butler came close",w:["Jimmy Butler","Nikola Jokic","No player wins Finals MVP on the losing team — Jimmy Butler came close","Jamal Murray"]},
      {q:"Who holds the record for the highest single-season assist average in NBA history?",a:"John Stockton (14.5 APG, 1989-90)",w:["Magic Johnson (13.1)","John Stockton (14.5 APG, 1989-90)","Isiah Thomas (13.9)","Oscar Robertson (11.5)"]},
      {q:"Which team had the best record in the 2023-24 regular season?",a:"Oklahoma City Thunder",w:["Boston Celtics","Oklahoma City Thunder","Milwaukee Bucks","Denver Nuggets"]},
      {q:"How many MVP awards did LeBron James win in his career?",a:"4",w:["3","4","5","6"]},
      {q:"Who was the 2017 NBA MVP leading the Rockets to 55 wins?",a:"James Harden",w:["Chris Paul","Steph Curry","James Harden","Kawhi Leonard"]},
      {q:"Which player won the 2024 NBA Finals MVP for the Celtics?",a:"Jaylen Brown",w:["Jayson Tatum","Al Horford","Jaylen Brown","Jrue Holiday"]},
      {q:"What was Wilt Chamberlain's scoring average in 1961-62, an NBA record?",a:"50.4 PPG",w:["44.8 PPG","48.1 PPG","50.4 PPG","52.2 PPG"]},
    ],
    hard:[
      {q:"Nikola Jokic is the only player in NBA history to be in the top 20 in both career PER and career assist percentage. True or false — and what is his career PER entering 2024?",a:"True — approximately 31.3 career PER",w:["False — PER is around 26.8","True — approximately 31.3 career PER","True — approximately 28.9 career PER","False — PER is around 29.4"]},
      {q:"Which player holds the NBA record for most triple-doubles in a career?",a:"Russell Westbrook (198)",w:["Magic Johnson (138)","Oscar Robertson (181)","Russell Westbrook (198)","LeBron James (107)"]},
      {q:"Stephen Curry set the record for most 3s in a playoff series with how many in 2015?",a:"98 total in 2015 playoffs",w:["78","88","98 total in 2015 playoffs","104"]},
      {q:"What was Michael Jordan's career playoff scoring average, an all-time record?",a:"33.4 PPG",w:["31.2 PPG","32.5 PPG","33.4 PPG","34.1 PPG"]},
      {q:"Which player had the highest usage rate in a single season at 38.8% in 2013-14?",a:"Kevin Durant",w:["Russell Westbrook","James Harden","Kevin Durant","Kobe Bryant"]},
      {q:"Joel Embiid's 33.1 PPG in 2022-23 was the highest MVP average since who?",a:"Allen Iverson (31.4 in 2001)",w:["Michael Jordan (30.1 in 1993)","Allen Iverson (31.4 in 2001)","Shaquille O'Neal (29.7)","Kobe Bryant (35.4 in 2006)"]},
      {q:"Which player averaged 40+ PPG over an entire season (1961-62)?",a:"Wilt Chamberlain (50.4, and also averaged 44.8 in 1962-63)",w:["Elgin Baylor","Wilt Chamberlain (50.4, and also averaged 44.8 in 1962-63)","Oscar Robertson","Jerry West"]},
      {q:"Who won the 2013 NBA MVP, averaging 28.1/10.0/7.3?",a:"LeBron James",w:["Kevin Durant","LeBron James","Carmelo Anthony","Chris Paul"]},
      {q:"Which team holds the record for the most losses in an NBA season?",a:"Charlotte Bobcats (7-59, 2011-12)",w:["Cleveland Cavaliers (17-65)","Charlotte Bobcats (7-59, 2011-12)","New Jersey Nets (12-70)","Dallas Mavericks (11-71)"]},
      {q:"LeBron's highest single-season PER was in 2009. What was it?",a:"31.7",w:["29.3","30.6","31.7","33.1"]},
      {q:"Kareem Abdul-Jabbar won 6 MVP awards. Who is second all-time with 5?",a:"Michael Jordan",w:["LeBron James","Bill Russell","Michael Jordan","Wilt Chamberlain"]},
      {q:"What is the record for most assists in a single NBA game?",a:"Scott Skiles (30 assists, 1990)",w:["Magic Johnson (24)","Bob Cousy (28)","Scott Skiles (30 assists, 1990)","John Stockton (25)"]},
      {q:"Which player won Finals MVP but his team still lost (has this ever happened)?",a:"No — Finals MVP has always gone to the winning team",w:["Jerry West (1969, unique case)","Wilt Chamberlain","No — Finals MVP has always gone to the winning team","Bill Russell"]},
      {q:"How many points did Kobe Bryant score in his legendary 81-point game in 2006?",a:"81 (vs. Toronto Raptors)",w:["72","76","81 (vs. Toronto Raptors)","88"]},
      {q:"Which player holds the record for highest True Shooting % in a single season (min. 1000 pts)?",a:"DeAndre Jordan (.710 in 2014-15)",w:["Shaquille O'Neal","Tyson Chandler","DeAndre Jordan (.710 in 2014-15)","Nikola Jokic"]},
    ],
  },
  nhl:{
    easy:[
      {q:"Who won the 2023 Hart Trophy (NHL MVP)?",a:"Connor McDavid",w:["Nathan MacKinnon","Connor McDavid","David Pastrnak","Leon Draisaitl"]},
      {q:"Which team won the 2023 Stanley Cup?",a:"Vegas Golden Knights",w:["Florida Panthers","Vegas Golden Knights","Carolina Hurricanes","Edmonton Oilers"]},
      {q:"Who was the 2023 Conn Smythe Trophy winner (playoff MVP)?",a:"Jonathan Marchessault",w:["William Karlsson","Mark Stone","Jonathan Marchessault","Adin Hill"]},
      {q:"How many Hart Trophies has Connor McDavid won as of 2024?",a:"3",w:["2","3","4","5"]},
      {q:"Who won the 2022 Hart Trophy?",a:"Auston Matthews",w:["Leon Draisaitl","Nathan MacKinnon","Auston Matthews","Connor McDavid"]},
      {q:"Which team won the 2022 Stanley Cup?",a:"Colorado Avalanche",w:["Tampa Bay Lightning","Colorado Avalanche","Edmonton Oilers","Carolina Hurricanes"]},
      {q:"Who was the 2022 Conn Smythe winner?",a:"Cale Makar",w:["Nathan MacKinnon","Mikko Rantanen","Cale Makar","Darcy Kuemper"]},
      {q:"Which team won back-to-back Stanley Cups in 2020 and 2021?",a:"Tampa Bay Lightning",w:["Montreal Canadiens","Tampa Bay Lightning","Colorado Avalanche","Florida Panthers"]},
      {q:"Who won the 2021 Hart Trophy?",a:"Connor McDavid",w:["Leon Draisaitl","Connor McDavid","Nathan MacKinnon","Auston Matthews"]},
      {q:"Who won the 2020 Hart Trophy?",a:"Leon Draisaitl",w:["Connor McDavid","Nathan MacKinnon","Leon Draisaitl","Alex Ovechkin"]},
      {q:"Alex Ovechkin holds the NHL record for most goals. How many as of 2024?",a:"893",w:["858","874","893","901"]},
      {q:"Who won the 2019 Stanley Cup with the Blues?",a:"St. Louis Blues (Ryan O'Reilly won Conn Smythe)",w:["Boston Bruins","St. Louis Blues (Ryan O'Reilly won Conn Smythe)","San Jose Sharks","Dallas Stars"]},
      {q:"Which team won the 2024 Stanley Cup?",a:"Florida Panthers",w:["Edmonton Oilers","Florida Panthers","New York Rangers","Carolina Hurricanes"]},
      {q:"Who won the 2024 Hart Trophy?",a:"Nathan MacKinnon",w:["Connor McDavid","Nikita Kucherov","Nathan MacKinnon","Auston Matthews"]},
      {q:"Leon Draisaitl won the 2020 Hart Trophy with what point total?",a:"110 points",w:["97 points","103 points","110 points","116 points"]},
      {q:"Who led the NHL in goals in 2022-23 with 60?",a:"David Pastrnak",w:["Connor McDavid","Leon Draisaitl","David Pastrnak","Tage Thompson"]},
      {q:"Which goalie won the Vezina Trophy in 2023?",a:"Linus Ullmark",w:["Igor Shesterkin","Andrei Vasilevskiy","Linus Ullmark","Juuse Saros"]},
      {q:"Who won the 2018 Hart Trophy?",a:"Taylor Hall",w:["Nikita Kucherov","Connor McDavid","Taylor Hall","Nathan MacKinnon"]},
      {q:"Which team won the 2018 Stanley Cup?",a:"Washington Capitals",w:["Vegas Golden Knights","Pittsburgh Penguins","Washington Capitals","Tampa Bay Lightning"]},
      {q:"Who won the 2024 Conn Smythe Trophy?",a:"Aleksander Barkov",w:["Sam Reinhart","Sergei Bobrovsky","Aleksander Barkov","Matthew Tkachuk"]},
    ],
    medium:[
      {q:"Connor McDavid's 2022-23 season — how many points did he record, the highest since Lemieux?",a:"153 points",w:["141","147","153 points","163"]},
      {q:"Which player scored 92 goals in 1981-82, the second-most in NHL history?",a:"Wayne Gretzky (who also scored 92 that year — Phil Esposito held the previous record with 76)",w:["Mike Bossy","Wayne Gretzky (who also scored 92 that year — Phil Esposito held the previous record with 76)","Mario Lemieux","Brett Hull"]},
      {q:"Nikita Kucherov set the record for most points in a single playoff year. How many?",a:"34 points (2019 playoffs)",w:["28","31","34 points (2019 playoffs)","37"]},
      {q:"Who won the Hart Trophy in 2019 with 128 points — his second Hart in a row?",a:"Nikita Kucherov",w:["Connor McDavid","Nikita Kucherov","Nathan MacKinnon","Taylor Hall"]},
      {q:"What year did Wayne Gretzky score his record 92 goals in a season?",a:"1981-82",w:["1979-80","1980-81","1981-82","1983-84"]},
      {q:"Which goalie had a .937 save percentage in 2021-22, winning the Vezina?",a:"Igor Shesterkin",w:["Andrei Vasilevskiy","Jake Oettinger","Igor Shesterkin","Thatcher Demko"]},
      {q:"Who won the Conn Smythe in 2021 leading Tampa to back-to-back cups?",a:"Andrei Vasilevskiy",w:["Nikita Kucherov","Brayden Point","Andrei Vasilevskiy","Victor Hedman"]},
      {q:"Nathan MacKinnon's 2022-23 season points total?",a:"111 points",w:["99","104","111 points","119"]},
      {q:"Which defenseman won the Norris Trophy in 2022 becoming one of the youngest ever?",a:"Cale Makar",w:["Adam Fox","Roman Josi","Cale Makar","Victor Hedman"]},
      {q:"How many points did Nikita Kucherov score in 2023-24 to lead the NHL?",a:"100 points",w:["87","93","100 points","108"]},
      {q:"Alex Ovechkin set the record for most power play goals in history. How many as of 2024?",a:"335",w:["298","312","335","354"]},
      {q:"Who won the Hart Trophy in both 2023 and 2024?",a:"Connor McDavid (2023) and Nathan MacKinnon (2024) — different winners",w:["Connor McDavid both years","Connor McDavid (2023) and Nathan MacKinnon (2024) — different winners","Nathan MacKinnon both years","Leon Draisaitl both years"]},
      {q:"Which player's 2020-21 season was historically anomalous — 85 points in 54 games while injured most of the year?",a:"Nikita Kucherov (ineligible for Hart due to IR loophole)",w:["Connor McDavid","Nikita Kucherov (ineligible for Hart due to IR loophole)","Leon Draisaitl","Artemi Panarin"]},
      {q:"Who won the Vezina Trophy in 2021 and 2022?",a:"Marc-Andre Fleury (2021) and Igor Shesterkin (2022)",w:["Andrei Vasilevskiy both years","Tuukka Rask (2021) and Igor Shesterkin (2022)","Marc-Andre Fleury (2021) and Igor Shesterkin (2022)","Juuse Saros both years"]},
      {q:"What was Auston Matthews' goal total in 2021-22, setting an American-born record?",a:"60 goals",w:["53","57","60 goals","64"]},
      {q:"Which team won three straight Stanley Cups from 2016-2018?",a:"No team — Pittsburgh won 2016 and 2017, Washington won 2018",w:["Pittsburgh Penguins (3 straight)","No team — Pittsburgh won 2016 and 2017, Washington won 2018","Tampa Bay Lightning","Chicago Blackhawks"]},
      {q:"Who won the 2021 Stanley Cup against the Montreal Canadiens?",a:"Tampa Bay Lightning",w:["Colorado Avalanche","Tampa Bay Lightning","Vegas Golden Knights","Carolina Hurricanes"]},
      {q:"What is Connor McDavid's career points per game, the highest in modern NHL history?",a:"1.48 PPG entering 2024",w:["1.31","1.38","1.48 PPG entering 2024","1.55"]},
      {q:"Which player became the fastest to 1,000 career points since Gretzky?",a:"Mario Lemieux",w:["Jaromir Jagr","Wayne Gretzky","Mario Lemieux","Steve Yzerman"]},
      {q:"Who won the 2017 Stanley Cup MVP playing for the Pittsburgh Penguins?",a:"Sidney Crosby",w:["Evgeni Malkin","Phil Kessel","Sidney Crosby","Matt Murray"]},
    ],
    hard:[
      {q:"Wayne Gretzky's all-time points record stands at 2,857. His ASSISTS ALONE (1,963) would be the all-time points record. True?",a:"True — his assists alone exceed every other player's total points",w:["False — Gordie Howe is second with 1,850 total points","True — his assists alone exceed every other player's total points","True — but only barely over Messier's 1,887","False — Jagr is second at 1,921 total points"]},
      {q:"Connor McDavid's 153-point 2022-23 season — whose record did it come closest to breaking?",a:"Mario Lemieux's 1995-96 mark of 161 points in 70 games",w:["Wayne Gretzky's 92-goal season","Mario Lemieux's 1995-96 mark of 161 points in 70 games","Steve Yzerman's 155 points in 1988-89","Brett Hull's 86 goals in 1990-91"]},
      {q:"Who holds the NHL record for most points in a single season by a defenseman?",a:"Bobby Orr (102 points, 1970-71)",w:["Paul Coffey (138 in 1985-86)","Denis Potvin (101)","Bobby Orr (102 points, 1970-71)","Al MacInnis (103)"]},
      {q:"Nikita Kucherov's 2023-24 regular season point total of 100 came despite missing significant time. Who led the NHL in points-per-game among qualifiers?",a:"Kucherov himself at 1.22 PPG",w:["Connor McDavid","Nathan MacKinnon","Kucherov himself at 1.22 PPG","Leon Draisaitl"]},
      {q:"Which goalie holds the record for most career wins in NHL history?",a:"Martin Brodeur (691 wins)",w:["Patrick Roy (551)","Martin Brodeur (691 wins)","Roberto Luongo (489)","Henrik Lundqvist (459)"]},
      {q:"How many Hart Trophies did Wayne Gretzky win in his career?",a:"9",w:["6","8","9","11"]},
      {q:"Who was the last player before McDavid to reach 150+ points in a season?",a:"Mario Lemieux (161 points in 1995-96)",w:["Jaromir Jagr (149 in 1995-96)","Steve Yzerman","Mario Lemieux (161 points in 1995-96)","Mark Messier"]},
      {q:"Cale Makar won the Norris Trophy in 2022 with how many points, a record for defensemen since Coffey?",a:"86 points",w:["74","79","86 points","92"]},
      {q:"Which goalie had a .942 SV% in 2014-15, the highest in the modern NHL?",a:"Carey Price",w:["Pekka Rinne","Ben Bishop","Carey Price","Tuukka Rask"]},
      {q:"Who scored 76 goals in 1992-93, the third-most in NHL history?",a:"Teemu Selanne",w:["Mario Lemieux","Brett Hull","Teemu Selanne","Luc Robitaille"]},
      {q:"Bobby Orr won the Norris Trophy how many consecutive times from 1967-1975?",a:"8 straight",w:["6 straight","7 straight","8 straight","All except one year"]},
      {q:"What is the record for most goals in a single NHL game by one player?",a:"7 goals (Joe Malone, 1920)",w:["5 goals (many players)","6 goals (Syd Howe, 1944)","7 goals (Joe Malone, 1920)","6 goals (Red Berenson, 1968)"]},
      {q:"Which team set the NHL record for most wins in a season in 2023-24?",a:"Florida Panthers",w:["New York Rangers","Florida Panthers","Vancouver Canucks","Colorado Avalanche"]},
      {q:"Nathan MacKinnon's 2022-23 regular season: his 111 points tied him with whom for 5th in Avs franchise history single-season points?",a:"Joe Sakic (1996-97)",w:["Peter Forsberg","Joe Sakic (1996-97)","Milan Hejduk","Paul Stastny"]},
      {q:"What does Gretzky's record of 92 goals in 1981-82 represent as goals-per-game rate?",a:"1.12 goals per game",w:["0.98 goals per game","1.05 goals per game","1.12 goals per game","1.18 goals per game"]},
    ],
  },
};

function shuffle(arr,rng){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function quickRng(){let s=Date.now()>>>0;return()=>{s=Math.imul(s^(s>>>13),s^(s<<7));s^=s>>>17;return(s>>>0)/4294967296;};}

// Strip parenthetical context from displayed choice text — scoring still uses full string
function cleanChoice(s){
  // Keep short parens like "(2019)" or "(unanimous)" — only strip long explanations
  return s.replace(/\s*\([^)]{30,}\)/g,"").replace(/\s*—[^"]{15,}/g,"").trim();
}

function TriviaPage({cu}){
  const mob=useIsMobile();
  const [sport,setSport]=useState(null);
  const [diff,setDiff]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [locked,setLocked]=useState(false);
  const [score,setScore]=useState(0);
  const [streak,setStreak]=useState(0);
  const [bestStreak,setBestStreak]=useState(0);
  const [results,setResults]=useState([]);
  const [phase,setPhase]=useState("pick"); // pick | diff | quiz | done

  const sportColor={mlb:"#22C55E",nfl:"#F97316",nba:"#3B82F6",nhl:"#A78BFA"};
  const sportEmoji={mlb:"⚾",nfl:"🏈",nba:"🏀",nhl:"🏒"};
  const diffColor={easy:"#22C55E",medium:"#F59E0B",hard:"#EF4444"};
  const diffIcon={easy:"🟢",medium:"🟡",hard:"🔴"};
  const ac=sport?sportColor[sport]:"#00D4FF";

  const pickSport=(s)=>{setSport(s);setPhase("diff");};

  const startQuiz=(s,d)=>{
    const rng=quickRng();
    const pool=shuffle(TRIVIA_Q[s][d],rng).slice(0,15);
    const qs=pool.map(q=>({...q,choices:shuffle(q.w,quickRng())}));
    setDiff(d);setQuestions(qs);setQIdx(0);setSelected(null);setLocked(false);
    setScore(0);setStreak(0);setBestStreak(0);setResults([]);setPhase("quiz");
  };

  const pick=(choice)=>{
    if(locked)return;
    setSelected(choice);setLocked(true);
    const q=questions[qIdx];
    const correct=choice===q.a;
    const ns=correct?streak+1:0;
    setBestStreak(b=>Math.max(b,ns));setStreak(ns);
    if(correct)setScore(s=>s+1);
    setResults(r=>[...r,{q:q.q,correct,chosen:choice,answer:q.a}]);
  };

  const saveStats=async(finalResults,finalScore)=>{
    if(!cu)return;
    const total=finalResults.length;
    const wrong=total-finalScore;
    try{
      // Upsert by updating cumulative totals
      const existing=await sb.get("nova_trivia_stats",`?user_id=eq.${cu.id}&limit=1`);
      if(existing&&existing.length>0){
        const e=existing[0];
        await sb.patch("nova_trivia_stats",{
          total_correct:e.total_correct+finalScore,
          total_wrong:e.total_wrong+wrong,
          total_questions:e.total_questions+total,
          games_played:e.games_played+1,
          last_played:Date.now(),
        },`?user_id=eq.${cu.id}`);
      } else {
        await sb.post("nova_trivia_stats",{
          id:gid(),user_id:cu.id,username:cu.username,display_name:cu.display_name,avatar:cu.avatar,avatar_url:cu.avatar_url,
          total_correct:finalScore,total_wrong:wrong,total_questions:total,games_played:1,last_played:Date.now()
        });
      }
    }catch(e){console.warn("Could not save trivia stats",e);}
  };

  const next=()=>{
    if(qIdx+1>=questions.length){
      const finalResults=[...results];
      // score state may lag, count directly
      const finalScore=finalResults.filter(r=>r.correct).length;
      saveStats(finalResults,finalScore);
      setPhase("done");return;
    }
    setQIdx(i=>i+1);setSelected(null);setLocked(false);
  };
  const quit=()=>{
    const finalResults=[...results];
    const finalScore=finalResults.filter(r=>r.correct).length;
    saveStats(finalResults,finalScore);
    setPhase("done");
  };
  const restart=()=>{setSport(null);setDiff(null);setPhase("pick");};

  // ── Pick sport ──
  if(phase==="pick") return(
    <div style={{maxWidth:480,margin:"0 auto",padding:mob?"24px 16px":"48px 20px",textAlign:"center"}}>
      <div style={{fontSize:mob?22:30,fontWeight:900,fontFamily:"'Orbitron',sans-serif",background:"linear-gradient(135deg,#00D4FF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6,letterSpacing:".05em"}}>SPORTS TRIVIA</div>
      <div style={{fontSize:12,color:"#475569",marginBottom:32}}>MVP awards · stat records · championships — no basic questions</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {["mlb","nfl","nba","nhl"].map(s=>(
          <button key={s} onClick={()=>pickSport(s)} style={{padding:"26px 16px",borderRadius:16,border:`1.5px solid ${sportColor[s]}44`,background:`${sportColor[s]}0e`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"all .2s"}}>
            <div style={{fontSize:34}}>{sportEmoji[s]}</div>
            <div style={{fontSize:13,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:sportColor[s],letterSpacing:".08em"}}>{s.toUpperCase()}</div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{Object.values(TRIVIA_Q[s]).flat().length} QUESTIONS</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Pick difficulty ──
  if(phase==="diff") return(
    <div style={{maxWidth:420,margin:"0 auto",padding:mob?"24px 16px":"48px 20px",textAlign:"center"}}>
      <button onClick={()=>setPhase("pick")} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:20,display:"flex",alignItems:"center",gap:6,margin:"0 auto 20px"}}>← back</button>
      <div style={{fontSize:20,marginBottom:4}}>{sportEmoji[sport]}</div>
      <div style={{fontSize:mob?18:22,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:ac,marginBottom:6,letterSpacing:".06em"}}>{sport?.toUpperCase()} TRIVIA</div>
      <div style={{fontSize:12,color:"#475569",marginBottom:28}}>Choose your difficulty</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[["easy","Casual Fan","MVP winners, championship years, basic career stats"],["medium","Stats Head","Specific numbers, award details, multi-year trends"],["hard","Historian","Record-breaking stats, obscure facts, deep analytics"]].map(([d,label,desc])=>(
          <button key={d} onClick={()=>startQuiz(sport,d)} style={{padding:"18px 20px",borderRadius:14,border:`1.5px solid ${diffColor[d]}44`,background:`${diffColor[d]}0e`,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,transition:"all .2s"}}>
            <div style={{fontSize:24,flexShrink:0}}>{diffIcon[d]}</div>
            <div>
              <div style={{fontSize:13,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:diffColor[d],letterSpacing:".06em",marginBottom:3}}>{d.toUpperCase()} — {label}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{desc}</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",flexShrink:0}}>{TRIVIA_Q[sport][d].length}Q</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Done ──
  if(phase==="done"){
    const total=results.length;
    const pct=total?Math.round((score/total)*100):0;
    const grade=pct>=93?"🏆 Immaculate":pct>=80?"⭐ Elite":pct>=67?"💪 Solid":pct>=50?"📚 Learning":"💀 Rough Game";
    return(
      <div style={{maxWidth:560,margin:"0 auto",padding:mob?"20px 14px":"40px 20px"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:44,marginBottom:8}}>{grade.split(" ")[0]}</div>
          <div style={{fontSize:mob?18:24,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:ac}}>{grade.slice(2)}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:4,fontFamily:"'Orbitron',sans-serif"}}>{sport?.toUpperCase()} · {diff?.toUpperCase()} · {sportEmoji[sport]}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
          {[["CORRECT",`${score}/${total}`],["ACCURACY",`${pct}%`],["BEST STREAK",`${bestStreak}🔥`]].map(([label,val])=>(
            <div key={label} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"12px 6px",textAlign:"center"}}>
              <div style={{fontSize:8,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".07em",marginBottom:4}}>{label}</div>
              <div style={{fontSize:mob?15:19,fontWeight:900,color:ac,fontFamily:"'Orbitron',sans-serif"}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"8px 14px",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em"}}>REVIEW</div>
          <div style={{maxHeight:260,overflowY:"auto"}}>
            {results.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,.03)",alignItems:"flex-start"}}>
                <div style={{fontSize:13,flexShrink:0,marginTop:1}}>{r.correct?"✅":"❌"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,color:"#CBD5E1",lineHeight:1.3,marginBottom:2}}>{r.q}</div>
                  {!r.correct&&<div style={{fontSize:10,color:"#22C55E",marginBottom:1}}>✓ {r.answer}</div>}
                  {!r.correct&&<div style={{fontSize:10,color:"#EF4444"}}>✗ {r.chosen}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>startQuiz(sport,diff)} style={{flex:1,padding:"12px",borderRadius:10,background:ac,border:"none",color:"#000",fontWeight:900,fontSize:12,fontFamily:"'Orbitron',sans-serif",cursor:"pointer"}}>🔄 PLAY AGAIN</button>
          <button onClick={()=>setPhase("diff")} style={{flex:1,padding:"12px",borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",color:"#94A3B8",fontWeight:700,fontSize:12,fontFamily:"'Orbitron',sans-serif",cursor:"pointer"}}>CHANGE DIFF</button>
          <button onClick={restart} style={{padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#64748B",fontSize:12,cursor:"pointer"}}>🏠</button>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  const q=questions[qIdx];
  const progress=(qIdx/questions.length)*100;
  const correctFeedback=["Locked in! 🔒","That's right! 🎯","Nailed it! 🔥","Correct! ✅","No doubt! 💪","Easy money 💰","Big brain! 🧠"][Math.floor(Math.random()*7)];
  return(
    <div style={{maxWidth:580,margin:"0 auto",padding:mob?"16px 12px":"32px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{sportEmoji[sport]}</span>
          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:diffColor[diff],fontWeight:700,letterSpacing:".06em"}}>{diff?.toUpperCase()}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {streak>=2&&<div style={{fontSize:11,color:"#F97316",fontWeight:700}}>{streak}🔥</div>}
          <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{score}/{qIdx}</div>
          <button onClick={quit} style={{padding:"4px 10px",borderRadius:6,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",fontSize:9,fontFamily:"'Orbitron',sans-serif",cursor:"pointer",fontWeight:700}}>QUIT</button>
        </div>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,marginBottom:18,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${ac},${ac}88)`,borderRadius:2,transition:"width .4s"}}/>
      </div>
      <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",marginBottom:8,letterSpacing:".1em"}}>Q {qIdx+1} / {questions.length}</div>
      <div style={{fontSize:mob?14:17,fontWeight:700,color:"#E2E8F0",lineHeight:1.45,marginBottom:20,minHeight:52}}>{q.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
        {q.choices.map((choice,i)=>{
          const isSel=selected===choice;
          const isCorr=choice===q.a;
          let bg="rgba(255,255,255,.03)",border="1px solid rgba(255,255,255,.08)",color="#CBD5E1";
          if(locked){
            if(isCorr){bg="rgba(34,197,94,.14)";border="1px solid rgba(34,197,94,.45)";color="#22C55E";}
            else if(isSel){bg="rgba(239,68,68,.14)";border="1px solid rgba(239,68,68,.4)";color="#EF4444";}
          } else if(isSel){bg=`${ac}1e`;border=`1px solid ${ac}77`;color="#E2E8F0";}
          return(
            <button key={i} onClick={()=>pick(choice)} disabled={locked}
              style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:10,background:bg,border,color,cursor:locked?"default":"pointer",textAlign:"left",transition:"all .15s",fontSize:mob?12:13,fontWeight:locked&&isCorr?700:400}}>
              <div style={{width:24,height:24,borderRadius:6,background:locked&&isCorr?"rgba(34,197,94,.25)":locked&&isSel&&!isCorr?"rgba(239,68,68,.25)":`${ac}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:locked&&isCorr?"#22C55E":locked&&isSel&&!isCorr?"#EF4444":ac,flexShrink:0}}>
                {locked&&isCorr?"✓":locked&&isSel&&!isCorr?"✗":["A","B","C","D"][i]}
              </div>
              {cleanChoice(choice)}
            </button>
          );
        })}
      </div>
      {locked&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{fontSize:12,fontWeight:700,color:selected===q.a?"#22C55E":"#EF4444",flex:1}}>
            {selected===q.a?correctFeedback:`❌ ${cleanChoice(q.a)}`}
          </div>
          <button onClick={next} style={{padding:"11px 22px",borderRadius:10,background:ac,border:"none",color:"#000",fontWeight:900,fontSize:11,fontFamily:"'Orbitron',sans-serif",cursor:"pointer",flexShrink:0,letterSpacing:".04em"}}>
            {qIdx+1>=questions.length?"RESULTS →":"NEXT →"}
          </button>
        </div>
      )}
    </div>
  );
}


function LeaderboardPage({users,navigate}){
  const mob=useIsMobile();
  const[tab,setTab]=useState("followers");
  const[triviaStats,setTriviaStats]=useState([]);
  const[triviaLoading,setTriviaLoading]=useState(false);
  useEffect(()=>{
    if(tab!=="trivia_correct"&&tab!=="trivia_accuracy"&&tab!=="trivia_wrong")return;
    setTriviaLoading(true);
    sb.get("nova_trivia_stats","?order=total_correct.desc&limit=50").then(rows=>{
      setTriviaStats(rows||[]);
      setTriviaLoading(false);
    }).catch(()=>setTriviaLoading(false));
  },[tab]);
  const boards={
    followers:{label:"👥 Followers",key:u=>(u.followers||[]).length,suffix:"followers"},
    badges:{label:"🏅 Badges",key:u=>(u.badges||[]).length,suffix:"badges"},
    predictions:{label:"🎯 Predictions",key:u=>u.correct_predictions||0,suffix:"correct picks"},
    connections:{label:"🌐 Social",key:u=>(u.followers||[]).length+(u.following||[]).length,suffix:"connections"},
  };
  const board=boards[tab];
  const sorted=board?[...users].sort((a,b)=>board.key(b)-board.key(a)).slice(0,20):[];
  const MEDALS=["🥇","🥈","🥉"];

  // Collect all comments across all users for comment likes leaderboard
  const[allComments,setAllComments]=useState([]);
  const[cmtLoading,setCmtLoading]=useState(false);
  useEffect(()=>{
    if(tab!=="commentlikes")return;
    setCmtLoading(true);
    sb.get("nova_comments","?order=timestamp.desc&limit=500").then(rows=>{
      setAllComments((rows||[]).filter(c=>(c.likes||[]).length>0).sort((a,b)=>(b.likes?.length||0)-(a.likes?.length||0)));
      setCmtLoading(false);
    });
  },[tab]);

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#F59E0B,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🏆 Leaderboard</h1>
        <p style={{color:"#475569",fontSize:14}}>Nova's top members across every category</p>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>
        {Object.entries(boards).map(([k,v])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:tab===k?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:tab===k?"#00D4FF":"#64748B",transition:"all .2s"}}>{v.label}</button>
        ))}
        <button onClick={()=>setTab("commentlikes")} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab==="commentlikes"?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)"}`,background:tab==="commentlikes"?"rgba(239,68,68,.12)":"rgba(255,255,255,.03)",color:tab==="commentlikes"?"#EF4444":"#64748B",transition:"all .2s"}}>❤️ Top Comments</button>
        {[["trivia_correct","🧠 Most Correct","#22C55E"],["trivia_accuracy","🎯 Best Accuracy","#00D4FF"],["trivia_wrong","💀 Most Wrong","#EF4444"]].map(([k,label,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?c+"88":"rgba(255,255,255,.1)"}`,background:tab===k?c+"18":"rgba(255,255,255,.03)",color:tab===k?c:"#64748B",transition:"all .2s"}}>{label}</button>
        ))}
      </div>

      {tab==="commentlikes"?(
        <div>
          {cmtLoading&&<div style={{textAlign:"center",padding:40,color:"#334155"}}>Loading top comments...</div>}
          {!cmtLoading&&allComments.length===0&&<Empty icon="❤️" msg="No liked comments yet!"/>}
          {!cmtLoading&&allComments.length>0&&(()=>{
            const top=allComments[0];
            const topUser=users.find(x=>x.id===top.author_id);
            return(<>
              {/* Showcase top comment */}
              <div style={{background:"linear-gradient(135deg,rgba(239,68,68,.15),rgba(245,158,11,.08))",border:"1px solid rgba(239,68,68,.3)",borderRadius:16,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#EF4444",letterSpacing:".12em",marginBottom:10}}>🏆 MOST LIKED COMMENT</div>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <Av user={topUser||{avatar:top.author_avatar,avatar_url:top.author_avatar_url,page_accent:"#EF4444"}} size={36}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:4,cursor:"pointer"}} onClick={()=>navigate("profile",top.author_id)}>{top.author_name}</div>
                    {top.text?.startsWith("__IMG__")
                      ?<img src={top.text.slice(7)} style={{maxWidth:200,maxHeight:140,borderRadius:8,objectFit:"contain"}}/>
                      :<div style={{fontSize:14,color:"#94A3B8",lineHeight:1.6}}>{top.text}</div>
                    }
                    <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:20}}>❤️</span>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#EF4444"}}>{top.likes?.length||0}</span>
                      <span style={{fontSize:11,color:"#475569"}}>likes</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Rest of top comments */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {allComments.slice(0,25).map((c,i)=>{
                  const au=users.find(x=>x.id===c.author_id);
                  return(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
                      <div style={{width:28,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?18:12,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#334155",flexShrink:0}}>{MEDALS[i]||`#${i+1}`}</div>
                      <Av user={au||{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#EF4444"}} size={32}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",cursor:"pointer",marginBottom:2}} onClick={()=>navigate("profile",c.author_id)}>{c.author_name}</div>
                        {c.text?.startsWith("__IMG__")
                          ?<span style={{fontSize:11,color:"#475569"}}>📷 Image</span>
                          :<div style={{fontSize:12,color:"#64748B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.text}</div>
                        }
                      </div>
                      <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                        <span>❤️</span><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:"#EF4444"}}>{c.likes?.length||0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>);
          })()}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sorted.map((u,i)=>(
            <div key={u.id} onClick={()=>navigate("profile",u.id)} style={{display:"flex",alignItems:"center",gap:mob?10:14,padding:mob?"12px 14px":"14px 18px",borderRadius:14,background:i===0?"linear-gradient(135deg,rgba(245,158,11,.12),rgba(251,191,36,.05))":i===1?"linear-gradient(135deg,rgba(148,163,184,.08),rgba(100,116,139,.04))":i===2?"linear-gradient(135deg,rgba(251,146,60,.1),rgba(234,88,12,.04))":"rgba(255,255,255,.03)",border:`1px solid ${i===0?"rgba(245,158,11,.3)":i===1?"rgba(148,163,184,.15)":i===2?"rgba(251,146,60,.2)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
              <div style={{width:32,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?20:13,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#334155",flexShrink:0}}>{MEDALS[i]||`#${i+1}`}</div>
              <Av user={u} size={mob?38:44}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name}</div>
                <div style={{fontSize:11,color:"#475569"}}>@{u.username}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:22,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#00D4FF"}}>{board.key(u)}</div>
                <div style={{fontSize:10,color:"#475569"}}>{board.suffix}</div>
              </div>
            </div>
          ))}
          {sorted.length===0&&<Empty icon="🏆" msg="No data yet!"/>}
        </div>
      )}
      {(tab==="trivia_correct"||tab==="trivia_accuracy"||tab==="trivia_wrong")&&(()=>{
        const MEDALS=["🥇","🥈","🥉"];
        if(triviaLoading)return <div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:12}}>LOADING…</div>;
        if(!triviaStats.length)return <Empty icon="🧠" msg="No trivia scores yet — play some trivia!"/>;
        let sorted2=[...triviaStats];
        let statKey,statLabel,statColor,statSuffix;
        if(tab==="trivia_correct"){
          sorted2.sort((a,b)=>(b.total_correct||0)-(a.total_correct||0));
          statKey=u=>u.total_correct||0; statLabel="TOTAL CORRECT"; statColor="#22C55E"; statSuffix="correct";
        } else if(tab==="trivia_accuracy"){
          sorted2=sorted2.filter(u=>(u.total_questions||0)>=10); // min 10 questions
          sorted2.sort((a,b)=>{
            const ra=(a.total_correct||0)/Math.max(a.total_questions||1,1);
            const rb=(b.total_correct||0)/Math.max(b.total_questions||1,1);
            return rb-ra;
          });
          statKey=u=>Math.round(((u.total_correct||0)/Math.max(u.total_questions||1,1))*100)+"%";
          statLabel="ACCURACY"; statColor="#00D4FF"; statSuffix="accuracy";
        } else {
          sorted2.sort((a,b)=>(b.total_wrong||0)-(a.total_wrong||0));
          statKey=u=>u.total_wrong||0; statLabel="TOTAL WRONG"; statColor="#EF4444"; statSuffix="wrong";
        }
        const top=sorted2[0];
        const topUser=users.find(x=>x.id===top?.user_id);
        return(
          <div>
            {/* Top player showcase */}
            {top&&(
              <div style={{background:`linear-gradient(135deg,${statColor}18,${statColor}08)`,border:`1px solid ${statColor}44`,borderRadius:16,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:statColor,letterSpacing:".12em",marginBottom:10}}>🏆 {statLabel} LEADER</div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <Av user={topUser||{avatar:top.avatar,avatar_url:top.avatar_url,display_name:top.display_name}} size={48}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{top.display_name||top.username}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{top.games_played} game{top.games_played!==1?"s":""} played · {top.total_questions} questions answered</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:28,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:statColor}}>{typeof statKey==="function"?statKey(top):statKey}</div>
                    <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{statSuffix}</div>
                  </div>
                </div>
              </div>
            )}
            {/* Full list */}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {sorted2.slice(0,20).map((u,i)=>{
                const usr=users.find(x=>x.id===u.user_id);
                const val=typeof statKey==="function"?statKey(u):statKey;
                const pct=u.total_questions?Math.round((u.total_correct/u.total_questions)*100):0;
                return(
                  <div key={u.user_id||i} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"12px 16px",cursor:"pointer"}} onClick={()=>navigate("profile",u.user_id)}>
                    <div style={{width:24,textAlign:"center",fontSize:i<3?18:13,flexShrink:0}}>{i<3?MEDALS[i]:`#${i+1}`}</div>
                    <Av user={usr||{avatar:u.avatar,avatar_url:u.avatar_url,display_name:u.display_name}} size={34}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name||u.username}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{u.games_played} games · {pct}% accuracy</div>
                    </div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:statColor,flexShrink:0}}>{val}</div>
                  </div>
                );
              })}
            </div>
            {tab==="trivia_accuracy"&&sorted2.length<triviaStats.length&&(
              <div style={{textAlign:"center",fontSize:10,color:"#334155",marginTop:12,fontFamily:"'Orbitron',sans-serif"}}>Minimum 10 questions required to appear on accuracy board</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}


// ─── Feed ──────────────────────────────────────────────────────────────────────
function FeedPage({users,cu,likes,onLike,navigate}){
  const mob=useIsMobile();
  const[feedIdx,setFeedIdx]=useState(0);
  const feedRef=useRef(null);
  const allClips=[];
  users.forEach(u=>{
    (u.page_clips||[]).forEach(c=>allClips.push({...c,owner:u}));
    (u.page_social||[]).forEach(c=>allClips.push({...c,owner:u}));
  });
  allClips.sort((a,b)=>(b.ts||0)-(a.ts||0));
  useEffect(()=>{
    const el=feedRef.current; if(!el)return;
    const h=()=>setFeedIdx(Math.round(el.scrollTop/el.clientHeight));
    el.addEventListener("scroll",h,{passive:true});
    return()=>el.removeEventListener("scroll",h);
  },[]);
  const feedH=mob?"calc(100vh - 120px)":"calc(100vh - 62px)";
  if(!allClips.length)return(
    <div style={{height:feedH,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,color:"#334155"}}>
      <div style={{fontSize:48}}>🎬</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14}}>No clips yet</div>
    </div>
  );
  return(
    <div ref={feedRef} className="feed-wrap" style={{height:feedH}}>
      {allClips.map((c,i)=>{
        const active=i===feedIdx;
        const liked=cu&&(likes[c.id]||[]).includes(cu.id);
        const likeCount=(likes[c.id]||[]).length;
        return(
          <div key={c.id+i} className="feed-item" style={{height:feedH,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",background:"#000",overflow:"hidden"}}>
            <div style={{width:"100%",maxWidth:520,padding:"0 16px",zIndex:2,position:"relative"}}>
              {c.type==="video"&&c.url&&<video src={c.url} controls={active} autoPlay={active} muted loop style={{width:"100%",maxHeight:"75vh",borderRadius:16,objectFit:"contain",background:"#000"}}/>}
              {c.type==="youtube"&&c.eid&&<iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="420" frameBorder="0" allow="accelerometer;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:16}}/>}
              {(c.type==="link"||c.type==="medal")&&(
                <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:28,textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🎮</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0",marginBottom:12}}>{c.title}</div>
                  <a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost">▶ Watch Clip</Btn></a>
                </div>
              )}
            </div>
            <div style={{position:"absolute",right:16,bottom:"15%",display:"flex",flexDirection:"column",gap:18,alignItems:"center",zIndex:10}}>
              <button onClick={()=>cu&&onLike(c.id,liked)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:liked?"#EF4444":"rgba(255,255,255,.8)"}}>
                <span style={{fontSize:32}}>{liked?"❤️":"🤍"}</span>
                <span style={{fontSize:11,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"white",textShadow:"0 1px 4px rgba(0,0,0,.8)"}}>{likeCount}</span>
              </button>
              <button onClick={()=>navigate("profile",c.owner.id)} style={{background:"none",border:"none",cursor:"pointer"}}>
                <Av user={c.owner} size={44}/>
              </button>
            </div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"60px 60px 24px 16px",background:"linear-gradient(transparent,rgba(0,0,0,.85))",zIndex:5}}>
              <div onClick={()=>navigate("profile",c.owner.id)} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
                <Av user={c.owner} size={32}/>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"white"}}>{c.owner.display_name}</span>
              </div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.9)",fontWeight:600}}>{c.title}</div>
            </div>
            {i===0&&allClips.length>1&&<div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",zIndex:10}}>SCROLL FOR MORE ↓</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────────
function HomePage({discordUrl,staffUsers,nav,users}){
  const mob=useIsMobile();
  const online=users.filter(u=>u.status_type==="online").length;

  const NAV_PAGES=[
    {p:"members",icon:"👥",label:"Members",color:"#00D4FF",desc:"Browse every Nova member, see their stats, teams, and profiles. Follow your favorites and connect with the community."},

    {p:"feed",icon:"🎬",label:"Clips Feed",color:"#EC4899",desc:"Watch and share highlight clips from the community. React, comment, and show love to the best plays."},
    {p:"gmmode",icon:"🏆",label:"GM Mode",color:"#F59E0B",desc:"Run any MLB, NFL, NBA or NHL team as GM. Manage contracts, trade players, sim a full season, and build a dynasty."},
    {p:"cards",icon:"⚾",label:"Nova Cards",color:"#F59E0B",desc:"Collect MLB player and team cards, open packs for real 2025 play cards, level up your cards and flex them on your profile."},

    {p:"trivia",icon:"🧠",label:"Trivia",color:"#A855F7",desc:"Challenge yourself with sports trivia across 4 sports and 3 difficulty levels. MVP years, stat records, championships and more."},
    {p:"leaderboard",icon:"🏆",label:"Leaderboard",color:"#F97316",desc:"See who's on top — ranked by followers, trivia score, predictions accuracy, and most liked comments."},
    {p:"hub",icon:"📊",label:"Hub",color:"#00D4FF",desc:"News, live scores, player stats, game logs, standings and predictions all in one place — across MLB, NBA, NHL, and NFL."},
    {p:"nffl",icon:"🏈",label:"Football League",color:"#F59E0B",desc:"Football League — player stats, game feed, transactions and rosters for our community football league."},
    {p:"nbbl",icon:"⚾",label:"Baseball League",color:"#22C55E",desc:"Baseball League — hitting stats, pitching stats, fielding stats and game feed for our community baseball league."},
    {p:"ringrush",icon:"🏀",label:"Basketball League",color:"#EC4899",desc:"Ring Rush — the Basketball League. Stats, rosters, game feed and player profiles for our community hoops league."},
    {p:"messages",icon:"💬",label:"Messages",color:"#38BDF8",desc:"Slide into DMs, create group chats, share clips and GIFs, and hop on voice calls with other Nova members."},
  ];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:"0 20px 100px"}}>
      {/* Hero */}
      <div style={{textAlign:"center",padding:mob?"50px 0 44px":"72px 0 60px"}}>
        <div className="fadeUp" style={{fontSize:mob?46:60,marginBottom:10,display:"inline-block",animation:"float 3.5s ease-in-out infinite"}}>💫</div>
        <h1 className="fadeUp d1" style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?"clamp(48px,16vw,76px)":"clamp(44px,7.5vw,88px)",fontWeight:900,lineHeight:1.02,letterSpacing:".06em",marginBottom:14,background:"linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00D4FF 65%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</h1>
        <p className="fadeUp d2" style={{fontSize:mob?14:17,color:"#94A3B8",maxWidth:420,margin:"0 auto 12px",lineHeight:1.7,fontWeight:500}}>The sports community for fans who actually know the game.</p>
        <div className="fadeUp d2" style={{display:"flex",gap:20,justifyContent:"center",marginBottom:26}}>
          <span style={{fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em"}}>{users.length} MEMBERS</span>
          <span style={{width:1,background:"rgba(255,255,255,.08)"}}/>
          <span style={{fontSize:11,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em",display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E"}}/>{online} ONLINE</span>
        </div>
        <div className="fadeUp d3" style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer"><Btn size="lg" style={{fontSize:12}}>🚀 Join Nova Discord</Btn></a>
          <Btn variant="ghost" size={mob?"md":"lg"} style={{fontSize:12}} onClick={()=>nav("members")}>👥 Browse Members</Btn>
        </div>
      </div>

      {/* Page cards */}
      <div style={{marginBottom:60}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",marginBottom:20}}>EXPLORE NOVA</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:mob?10:14}}>
          {NAV_PAGES.map(({p,icon,label,color,desc})=>(
            <Card key={p} onClick={()=>nav(p)} style={{padding:mob?"14px":"20px 22px",cursor:"pointer",display:"flex",flexDirection:"column",gap:10,borderColor:"rgba(255,255,255,.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:color+"18",border:`1px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?18:20,flexShrink:0}}>{icon}</div>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color,letterSpacing:".06em"}}>{label.toUpperCase()}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:14,color:"#334155",flexShrink:0}}>→</div>
              </div>
              <div style={{fontSize:mob?11:12,color:"#64748B",lineHeight:1.6}}>{desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Staff */}
      {staffUsers.length>0&&(
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",textTransform:"uppercase",marginBottom:24}}>Meet the Staff</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
            {staffUsers.map(u=>(
              <Card key={u.id} style={{padding:"20px 16px",textAlign:"center"}} onClick={()=>nav("profile",u.id)}>
                <div style={{position:"relative",width:56,height:56,margin:"0 auto 10px"}}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.6))`,border:`2px solid ${u.page_accent||"#00D4FF"}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden",boxShadow:`0 0 20px ${u.page_accent||"#00D4FF"}33`}}>
                    {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
                  </div>
                  <StatusDot type={u.status_type||"offline"} size={12} style={{position:"absolute",bottom:1,right:1}}/>
                </div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:6}}>{u.display_name}</div>
                {u.staff_role&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Members ───────────────────────────────────────────────────────────────────
function MembersPage({users,nav}){
  const mob=useIsMobile();
  const[q,setQ]=useState("");
  const[filter,setFilter]=useState("all");
  const list=users.filter(u=>{
    const m=(u.display_name||"").toLowerCase().includes(q.toLowerCase())||(u.username||"").toLowerCase().includes(q.toLowerCase());
    if(filter==="online")return m&&u.status_type==="online";
    if(filter==="staff")return m&&u.staff_role;
    return m;
  });
  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:"44px 16px 100px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#fff,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Members</h1>
        <p style={{color:"#475569",marginBottom:20,fontSize:14}}>{users.length} members across the galaxy</p>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search members..." style={{maxWidth:320,margin:"0 auto 12px",display:"block"}}/>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          {[["all","All"],["online","🟢 Online"],["staff","⚡ Staff"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,border:`1px solid ${filter===v?"rgba(0,212,255,.4)":"rgba(255,255,255,.08)"}`,background:filter===v?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:filter===v?"#00D4FF":"#475569"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(200px,1fr))",gap:mob?10:12}}>
        {list.map(u=>(
          <Card key={u.id} style={{padding:mob?12:16,cursor:"pointer"}} onClick={()=>nav("profile",u.id)}>
            <div style={{position:"relative",width:48,height:48,marginBottom:10}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.6))`,border:`2px solid ${u.page_accent||"#00D4FF"}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden"}}>
                {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
              </div>
              <StatusDot type={u.status_type||"offline"} size={11} style={{position:"absolute",bottom:0,right:0}}/>
            </div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name}</div>
            <div style={{fontSize:11,color:"#475569",marginBottom:5}}>@{u.username}</div>
            {u.staff_role&&<div style={{marginBottom:5}}><RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge></div>}
            {(u.mlb_team||u.nfl_team||u.nba_team||u.nhl_team)&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>{u.mlb_team&&<TeamBadge teamId={u.mlb_team}/>}{u.nfl_team&&<TeamBadge teamId={u.nfl_team}/>}{u.nba_team&&<TeamBadge teamId={u.nba_team}/>}{u.nhl_team&&<TeamBadge teamId={u.nhl_team}/>}</div>}
            <div style={{display:"flex",gap:8,fontSize:11,color:"#475569"}}><span>{(u.followers||[]).length} followers</span><span>·</span><span>{(u.badges||[]).length} 🏅</span></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tiny UI pieces ────────────────────────────────────────────────────────────
function Btn({children,onClick,variant="primary",size="md",style:ext={},disabled}){
  const [h,setH]=useState(false);
  const fs=size==="sm"?10:size==="lg"?14:11;
  const pd=size==="sm"?"6px 13px":size==="lg"?"14px 30px":"8px 16px";
  const base={display:"inline-flex",alignItems:"center",gap:6,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".06em",border:"none",borderRadius:8,transition:"all .22s",opacity:disabled?.5:1,fontSize:fs,padding:pd,transform:h&&!disabled?"translateY(-1px)":""};
  const v={
    primary:{background:h?"linear-gradient(135deg,#00bfea,#7c3aed)":"linear-gradient(135deg,#00D4FF,#8B5CF6)",color:"#fff",boxShadow:h?"0 8px 28px rgba(0,212,255,.35)":"none"},
    ghost:{background:h?"rgba(0,212,255,.1)":"transparent",border:"1px solid rgba(0,212,255,.4)",color:"#00D4FF"},
    danger:{background:h?"rgba(239,68,68,.25)":"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.35)",color:"#EF4444"},
    muted:{background:h?"rgba(255,255,255,.1)":"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8"},
    follow:{background:h?"rgba(0,212,255,.18)":"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.35)",color:"#00D4FF"},
    unfollow:{background:h?"rgba(239,68,68,.15)":"rgba(255,255,255,.05)",border:`1px solid ${h?"rgba(239,68,68,.4)":"rgba(255,255,255,.12)"}`,color:h?"#EF4444":"#94A3B8"},
  };
  return <button style={{...base,...v[variant],...ext}} onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}</button>;
}
function RoleBadge({children,color="#00D4FF"}){return <span style={{display:"inline-block",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",borderRadius:20,background:color+"22",border:`1px solid ${color}55`,color}}>{children}</span>;}
const Card=React.forwardRef(function Card({children,style:ext={},hover=true,onClick},ref){
  const [h,setH]=useState(false);
  return <div ref={ref} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:"rgba(255,255,255,.03)",backdropFilter:"blur(14px)",border:`1px solid ${h&&hover?"rgba(0,212,255,.28)":"rgba(255,255,255,.07)"}`,borderRadius:14,transition:"all .28s",transform:h&&hover?"translateY(-2px)":"",boxShadow:h&&hover?"0 12px 40px rgba(0,0,0,.3)":"none",cursor:onClick?"pointer":"default",...ext}}>{children}</div>;
});
function Modal({children,onClose,title,width=480}){
  const mob=useIsMobile();
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.82)",backdropFilter:"blur(10px)",display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",padding:mob?0:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"linear-gradient(150deg,#0c1220,#10172a)",border:"1px solid rgba(0,212,255,.18)",borderRadius:mob?"20px 20px 0 0":"18px",padding:mob?"24px 20px 32px":"30px 32px",width:"100%",maxWidth:mob?"100%":width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -20px 60px rgba(0,0,0,.7)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?15:17,fontWeight:700,color:"#E2E8F0"}}>{title}</h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#94A3B8",cursor:"pointer",fontSize:16,padding:"5px 10px"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Lbl({children}){return <div style={{fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".1em",color:"#475569",textTransform:"uppercase",marginBottom:7}}>{children}</div>;}
function Sec({title,children,onAdd}){return <div style={{marginBottom:34}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:"#E2E8F0",letterSpacing:".05em"}}>{title}</h2>{onAdd&&<Btn variant="ghost" size="sm" onClick={onAdd}>＋ Add</Btn>}</div>{children}</div>;}
function Empty({icon,msg}){return <div style={{textAlign:"center",padding:"36px 20px",color:"#334155",border:"1px dashed rgba(255,255,255,.07)",borderRadius:12}}><div style={{fontSize:30,marginBottom:8,opacity:.3}}>{icon}</div><div style={{fontSize:13}}>{msg}</div></div>;}
function XBtn({onClick,style:ext={}}){const [h,setH]=useState(false);return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?"#ef4444":"rgba(239,68,68,.8)",border:"none",borderRadius:6,width:26,height:26,color:"white",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",zIndex:10,...ext}}>✕</button>;}
function StatusDot({type,size=12,style:ext={}}){const s=STATUS_META[type]||STATUS_META.offline;return <div style={{width:size,height:size,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:type!=="offline"?`0 0 ${size/2}px ${s.color}88`:"none",border:"2px solid rgba(3,7,18,.9)",...ext}} title={s.label}/>;}
function AvatarCircle({user,size=36,onClick}){return <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`radial-gradient(circle,${user?.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,border:`2px solid ${user?.page_accent||"#00D4FF"}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.45,overflow:"hidden",cursor:onClick?"pointer":"default"}}>{user?.avatar_url?<img src={user.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:user?.avatar||"👤"}</div>;}
const Av=AvatarCircle;
function BannerUploadBtn({label,onUpload}){const [up,setUp]=useState(false);const ref=useRef(null);const h=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024){alert("Max 10MB");return;}setUp(true);await onUpload(f);setUp(false);e.target.value="";};return <><input type="file" ref={ref} accept="image/*" onChange={h} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>ref.current.click()} disabled={up}>{up?"⏳":label}</Btn></>;
}
const BannerBtn=BannerUploadBtn;
function CommentImgUpload({onUpload}){
  const[up,setUp]=useState(false);const ref=useRef(null);
  const h=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>8*1024*1024){alert("Max 8MB");return;}setUp(true);await onUpload(f);setUp(false);e.target.value="";};
  return <><input type="file" ref={ref} accept="image/*" onChange={h} style={{display:"none"}}/><button onClick={()=>ref.current.click()} disabled={up} title="Attach photo" style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,color:"#64748B",display:"flex",alignItems:"center",gap:5,width:"fit-content"}}>{up?"⏳ Uploading...":"📷 Add Photo"}</button></>;
}
function playerHeadshotUrl(playerId,sport){
  if(!playerId)return"";
  if(sport==="mlb")return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
  // ESPN uses different CDN paths — try multiple via component onError fallback chain
  // Primary: new ESPN CDN format
  return`https://a.espncdn.com/combiner/i?img=/i/headshots/${sport}/players/full/${playerId}.png&w=350&h=254&cb=1`;
}
function TeamLogo({espn,sport,size=22}){const [err,setErr]=useState(false);if(err)return <span style={{fontSize:size*.65}}>{sport==="mlb"?"⚾":sport==="nfl"?"🏈":sport==="nba"?"🏀":"🏒"}</span>;return <img src={`https://a.espncdn.com/i/teamlogos/${sport}/500/${espn}.png`} width={size} height={size} style={{objectFit:"contain",flexShrink:0}} onError={()=>setErr(true)}/>;}
function TeamBadge({teamId}){
  const allTeams=[...MLB_TEAMS,...NFL_TEAMS,...NBA_TEAMS,...NHL_TEAMS];
  const team=allTeams.find(t=>t.id===teamId);if(!team)return null;
  const sport=teamId.startsWith("nfl_")?"nfl":teamId.startsWith("nba_")?"nba":teamId.startsWith("nhl_")?"nhl":"mlb";
  return <div style={{display:"inline-flex",alignItems:"center",gap:5,background:team.color+"22",border:`1.5px solid ${team.color}66`,borderRadius:20,padding:"3px 10px"}}><TeamLogo espn={team.espn} sport={sport} size={18}/><span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:team.color,letterSpacing:".06em"}}>{team.abbr}</span><span style={{fontSize:9,color:team.color+"cc",fontWeight:600}}>{team.name}</span></div>;
}
function TeamPicker({sport,teams,value,onChange}){
  const byDiv={};
  teams.forEach(t=>{if(!byDiv[t.div])byDiv[t.div]=[];byDiv[t.div].push(t);});
  return(
    <div style={{maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
      {Object.entries(byDiv).map(([div,ts])=>(
        <div key={div}>
          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:6}}>{div}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {ts.map(t=>(
              <button key={t.id} onClick={()=>onChange(value===t.id?"":t.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${value===t.id?t.color+"aa":"rgba(255,255,255,.1)"}`,background:value===t.id?t.color+"22":"rgba(255,255,255,.03)",transition:"all .15s"}}>
                <TeamLogo espn={t.espn} sport={sport} size={16}/>
                <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:value===t.id?t.color:"#94A3B8"}}>{t.abbr}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialLinks({user}){
  const platforms=Object.keys(SOCIAL_ICONS).filter(k=>user[`social_${k}`]);
  if(!platforms.length)return null;
  return (
    <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:10,marginBottom:4}}>
      {platforms.map(k=>{
        const val=user[`social_${k}`]; const color=SOCIAL_COLORS[k];
        const inner=<div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:color+"18",border:`1.5px solid ${color}44`,cursor:k!=="discord"?"pointer":"default"}}><span style={{color,display:"flex",alignItems:"center"}}>{SOCIAL_ICONS[k]}</span><span style={{fontSize:12,fontWeight:600,color:"#C4CDD6"}}>{k==="discord"?val:`@${val}`}</span></div>;
        if(k==="discord")return <div key={k}>{inner}</div>;
        const urls={roblox:`https://www.roblox.com/search/users?keyword=${val}`,instagram:`https://instagram.com/${val}`,twitter:`https://twitter.com/${val}`,youtube:val.startsWith("http")?val:`https://youtube.com/@${val}`};
        return <a key={k} href={urls[k]} target="_blank" rel="noopener noreferrer">{inner}</a>;
      })}
    </div>
  );
}

function LikeBtn({clipId,cu,likes,onLike}){
  const liked=cu&&(likes[clipId]||[]).includes(cu.id);
  const count=(likes[clipId]||[]).length;
  const [bounce,setBounce]=useState(false);
  const click=()=>{if(!cu)return;setBounce(true);setTimeout(()=>setBounce(false),300);onLike(clipId,liked);};
  return <button onClick={click} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:cu?"pointer":"not-allowed",color:liked?"#EF4444":"#64748B",transform:bounce?"scale(1.3)":"scale(1)",transition:"transform .15s"}}>
    <span style={{fontSize:22,lineHeight:1}}>{liked?"❤️":"🤍"}</span>
    <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{count}</span>
  </button>;
}

function ClipCarousel({clips,canEdit,onDelete,emptyIcon,emptyMsg,cu,likes,onLike}){
  const [idx,setIdx]=useState(0);const [key,setKey]=useState(0);
  const touchRef=useRef(null);const timerRef=useRef(null);
  const ci=clips.length?Math.min(idx,clips.length-1):0;
  const go=dir=>{setIdx(i=>(i+dir+clips.length)%clips.length);setKey(k=>k+1);reset();};
  const reset=()=>{clearInterval(timerRef.current);if(clips.length>1)timerRef.current=setInterval(()=>{setIdx(i=>(i+1)%clips.length);setKey(k=>k+1);},60000);};
  useEffect(()=>{reset();return()=>clearInterval(timerRef.current);},[clips.length]);
  if(!clips.length)return <Empty icon={emptyIcon} msg={emptyMsg}/>;
  const c=clips[ci];
  const renderClip=()=>{
    if(c.type==="video"&&c.url)return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><video src={c.url} controls width="100%" style={{borderRadius:10,maxHeight:260,background:"#000"}}/></div>;
    if(c.type==="youtube"&&c.eid)return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="220" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:10}}/></div>;
    if(c.type==="medal")return <Card style={{padding:18}}><div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:8}}>MEDAL.TV</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div>{c.eid?<iframe src={`https://medal.tv/clip/${c.eid}/embed`} width="100%" height="200" frameBorder="0" allowFullScreen style={{borderRadius:8}}/>:<a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch</Btn></a>}</Card>;
    return <Card style={{padding:18}}><div style={{display:"flex",gap:14}}><div style={{fontSize:28}}>{c.platform==="instagram"?"📸":"🎬"}</div><div style={{flex:1}}><div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",marginBottom:6}}>{c.platform==="instagram"?"INSTAGRAM REEL":"CLIP"}</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div><a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch Clip</Btn></a></div></div></Card>;
  };
  return (
    <div style={{userSelect:"none"}}>
      <div onTouchStart={e=>touchRef.current=e.touches[0].clientX} onTouchEnd={e=>{if(touchRef.current===null||clips.length<2)return;const d=touchRef.current-e.changedTouches[0].clientX;if(Math.abs(d)>50)go(d>0?1:-1);touchRef.current=null;}} style={{position:"relative"}}>
        <div key={key} className="carousel-slide">{renderClip()}</div>
        {clips.length>1&&<>
          <button onClick={()=>go(-1)} style={{position:"absolute",left:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>‹</button>
          <button onClick={()=>go(1)} style={{position:"absolute",right:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>›</button>
        </>}
        {canEdit&&<XBtn onClick={()=>{onDelete(c.id);setIdx(0);}} style={{position:"absolute",top:0,right:0}}/>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.06)"}}>
        {clips.length>1
          ? <div style={{display:"flex",alignItems:"center",gap:6}}>{clips.map((_,i)=><div key={i} onClick={()=>{setIdx(i);setKey(k=>k+1);reset();}} style={{width:i===ci?20:7,height:7,borderRadius:i===ci?4:3.5,background:i===ci?"#00D4FF":"rgba(255,255,255,.15)",cursor:"pointer",transition:"all .25s"}}/>)}<span style={{fontSize:11,color:"#334155",marginLeft:4}}>{ci+1}/{clips.length}</span></div>
          : <div/>
        }
        {likes&&onLike&&<LikeBtn clipId={c.id} cu={cu} likes={likes} onLike={onLike}/>}
      </div>
    </div>
  );
}

function Starfield(){
  const canvasRef=useRef(null);
  const rafRef=useRef(null);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let W=window.innerWidth, H=window.innerHeight;

    // ── resize ──
    const resize=()=>{
      W=window.innerWidth; H=window.innerHeight;
      canvas.width=W; canvas.height=H;
    };
    resize();
    window.addEventListener("resize",resize);

    // ── stars ──
    const NUM=280;
    const stars=Array.from({length:NUM},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.6+0.3,
      baseAlpha:Math.random()*0.6+0.2,
      alpha:0,
      twinkleSpeed:Math.random()*0.008+0.003,
      twinkleDir:Math.random()>0.5?1:-1,
      color:Math.random()>0.88
        ?(Math.random()>0.5?"#b3d9ff":"#d4b3ff")
        :"#ffffff",
      glow:Math.random()>0.92,
    }));
    // Stagger initial alpha
    stars.forEach(s=>{ s.alpha=Math.random()*s.baseAlpha; });

    // ── shooting stars ──
    const shoots=[];
    const spawnShoot=()=>{
      // Start from top-right area, angle downward-left
      const angle=Math.PI*0.8+Math.random()*Math.PI*0.3; // ~145–199 deg
      const speed=Math.random()*6+8;
      shoots.push({
        x:Math.random()*W*0.8+W*0.2,
        y:Math.random()*H*0.3,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed,
        len:Math.random()*140+80,
        alpha:1,
        width:Math.random()*1.2+0.4,
        trail:[],
      });
    };

    // Shoot every 3–8 seconds
    let nextShoot=Date.now()+3000+Math.random()*5000;

    // ── Rocket ──
    let rocket=null;
    let nextRocket=Date.now()+8000+Math.random()*12000;
    const spawnRocket=()=>{
      // Pick a random edge to enter from
      const side=Math.floor(Math.random()*4); // 0=top,1=right,2=bottom,3=left
      let x,y,angle;
      if(side===0){x=Math.random()*W;y=-60;angle=Math.PI/2+((Math.random()-.5)*0.6);}
      else if(side===1){x=W+60;y=Math.random()*H;angle=Math.PI+((Math.random()-.5)*0.6);}
      else if(side===2){x=Math.random()*W;y=H+60;angle=-Math.PI/2+((Math.random()-.5)*0.6);}
      else{x=-60;y=Math.random()*H;angle=(Math.random()-.5)*0.6;}
      const speed=2.2+Math.random()*1.4;
      rocket={x,y,angle,speed,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,trail:[],size:1+Math.random()*0.5};
    };

    const drawRocket=(r)=>{
      // Trail
      for(let t=1;t<r.trail.length;t++){
        const prog=t/r.trail.length;
        ctx.save();
        ctx.globalAlpha=prog*0.35;
        ctx.strokeStyle=`rgba(255,160,60,${prog})`;
        ctx.lineWidth=3*prog*r.size;
        ctx.lineCap="round";
        ctx.beginPath();
        ctx.moveTo(r.trail[t-1].x,r.trail[t-1].y);
        ctx.lineTo(r.trail[t].x,r.trail[t].y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.translate(r.x,r.y);
      ctx.rotate(r.angle+Math.PI/2);
      const sc=r.size*14;
      // Flame flicker
      const flicker=0.7+Math.random()*0.6;
      // Flame
      ctx.beginPath();
      ctx.moveTo(0,sc*0.6);
      ctx.lineTo(-sc*0.22*flicker,sc*1.2*flicker);
      ctx.lineTo(0,sc*0.95);
      ctx.lineTo(sc*0.22*flicker,sc*1.2*flicker);
      ctx.closePath();
      const flameGrad=ctx.createLinearGradient(0,sc*0.6,0,sc*1.2);
      flameGrad.addColorStop(0,"rgba(255,220,80,0.95)");
      flameGrad.addColorStop(0.5,"rgba(255,100,20,0.8)");
      flameGrad.addColorStop(1,"rgba(255,40,0,0)");
      ctx.fillStyle=flameGrad;
      ctx.fill();
      // Body
      ctx.beginPath();
      ctx.moveTo(0,-sc);
      ctx.bezierCurveTo(sc*0.45,-sc*0.5,sc*0.45,sc*0.3,sc*0.28,sc*0.6);
      ctx.lineTo(-sc*0.28,sc*0.6);
      ctx.bezierCurveTo(-sc*0.45,sc*0.3,-sc*0.45,-sc*0.5,0,-sc);
      const bodyGrad=ctx.createLinearGradient(-sc*0.4,0,sc*0.4,0);
      bodyGrad.addColorStop(0,"#a0b4c8");
      bodyGrad.addColorStop(0.35,"#e8f0f8");
      bodyGrad.addColorStop(0.65,"#c8d8e8");
      bodyGrad.addColorStop(1,"#7090a8");
      ctx.fillStyle=bodyGrad;
      ctx.fill();
      // Window
      ctx.beginPath();
      ctx.arc(0,-sc*0.28,sc*0.18,0,Math.PI*2);
      ctx.fillStyle="rgba(120,200,255,0.85)";
      ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.5)";
      ctx.lineWidth=1;
      ctx.stroke();
      // Left fin
      ctx.beginPath();
      ctx.moveTo(-sc*0.28,sc*0.4);
      ctx.lineTo(-sc*0.7,sc*0.9);
      ctx.lineTo(-sc*0.28,sc*0.65);
      ctx.closePath();
      ctx.fillStyle="#8aaabb";
      ctx.fill();
      // Right fin
      ctx.beginPath();
      ctx.moveTo(sc*0.28,sc*0.4);
      ctx.lineTo(sc*0.7,sc*0.9);
      ctx.lineTo(sc*0.28,sc*0.65);
      ctx.closePath();
      ctx.fillStyle="#8aaabb";
      ctx.fill();
      ctx.restore();
    };

    // ── draw loop ──
    const draw=()=>{
      ctx.clearRect(0,0,W,H);

      // Deep space bg
      const bg=ctx.createRadialGradient(W*0.18,H*0.38,0,W*0.5,H*0.5,W*0.9);
      bg.addColorStop(0,"#0e0228");
      bg.addColorStop(0.55,"#030712");
      bg.addColorStop(1,"#030712");
      ctx.fillStyle=bg;
      ctx.fillRect(0,0,W,H);

      // Soft nebula glow top-right
      const neb=ctx.createRadialGradient(W*0.78,H*0.15,0,W*0.78,H*0.15,W*0.35);
      neb.addColorStop(0,"rgba(139,92,246,0.07)");
      neb.addColorStop(1,"transparent");
      ctx.fillStyle=neb;
      ctx.fillRect(0,0,W,H);

      // Second nebula bottom-left
      const neb2=ctx.createRadialGradient(W*0.12,H*0.82,0,W*0.12,H*0.82,W*0.28);
      neb2.addColorStop(0,"rgba(0,180,255,0.05)");
      neb2.addColorStop(1,"transparent");
      ctx.fillStyle=neb2;
      ctx.fillRect(0,0,W,H);

      // Draw stars
      stars.forEach(s=>{
        // Twinkle
        s.alpha+=s.twinkleSpeed*s.twinkleDir;
        if(s.alpha>=s.baseAlpha){s.alpha=s.baseAlpha;s.twinkleDir=-1;}
        else if(s.alpha<=0.05){s.alpha=0.05;s.twinkleDir=1;}

        ctx.save();
        ctx.globalAlpha=s.alpha;
        if(s.glow){
          const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*5);
          g.addColorStop(0,s.color);
          g.addColorStop(1,"transparent");
          ctx.fillStyle=g;
          ctx.fillRect(s.x-s.r*5,s.y-s.r*5,s.r*10,s.r*10);
        }
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=s.color;
        ctx.fill();
        ctx.restore();
      });

      // Shoot new star?
      const now=Date.now();
      if(now>=nextShoot){
        spawnShoot();
        nextShoot=now+3000+Math.random()*5000;
      }

      // Draw shooting stars
      for(let i=shoots.length-1;i>=0;i--){
        const sh=shoots[i];
        sh.x+=sh.vx; sh.y+=sh.vy;
        sh.alpha-=0.018;
        sh.trail.push({x:sh.x,y:sh.y});
        if(sh.trail.length>30)sh.trail.shift();

        if(sh.alpha<=0||sh.x<-200||sh.y>H+200){shoots.splice(i,1);continue;}

        // Draw trail
        ctx.save();
        ctx.lineCap="round";
        for(let t=1;t<sh.trail.length;t++){
          const prog=t/sh.trail.length;
          ctx.globalAlpha=sh.alpha*prog*0.9;
          ctx.strokeStyle=`rgba(200,230,255,${prog})`;
          ctx.lineWidth=sh.width*(1-prog*0.5);
          ctx.beginPath();
          ctx.moveTo(sh.trail[t-1].x,sh.trail[t-1].y);
          ctx.lineTo(sh.trail[t].x,sh.trail[t].y);
          ctx.stroke();
        }
        // Bright head
        ctx.globalAlpha=sh.alpha;
        const headGlow=ctx.createRadialGradient(sh.x,sh.y,0,sh.x,sh.y,sh.width*4);
        headGlow.addColorStop(0,"rgba(255,255,255,1)");
        headGlow.addColorStop(0.4,"rgba(180,220,255,0.6)");
        headGlow.addColorStop(1,"transparent");
        ctx.fillStyle=headGlow;
        ctx.fillRect(sh.x-sh.width*4,sh.y-sh.width*4,sh.width*8,sh.width*8);
        ctx.restore();
      }

      // Update and draw rocket
      const nowR=Date.now();
      if(!rocket&&nowR>=nextRocket){
        spawnRocket();
        nextRocket=nowR+10000+Math.random()*15000;
      }
      if(rocket){
        rocket.trail.push({x:rocket.x,y:rocket.y});
        if(rocket.trail.length>50)rocket.trail.shift();
        rocket.x+=rocket.vx;
        rocket.y+=rocket.vy;
        drawRocket(rocket);
        // Despawn if off screen (with margin)
        if(rocket.x<-200||rocket.x>W+200||rocket.y<-200||rocket.y>H+200){
          rocket=null;
        }
      }

      rafRef.current=requestAnimationFrame(draw);
    };

    draw();
    return()=>{
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",resize);
    };
  },[]);

  return(
    <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,display:"block",pointerEvents:"none"}}/>
  );
}

function NotifBell({notifs,onRead,onClear,onMarkOne,navigate,users}){
  const [open,setOpen]=useState(false);const ref=useRef(null);
  const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const handleClick=(n)=>{
    if(!n.read&&onMarkOne)onMarkOne(n.id);
    if(n.meta?.type==="news"&&n.meta?.url){window.open(n.meta.url,"_blank");setOpen(false);}
    else if(n.from_user_id&&n.from_user_id!==n.to_user_id){navigate("profile",n.from_user_id);setOpen(false);}
  };
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>{setOpen(o=>!o);}} className={unread>0?"bell-shake":""} style={{background:open?"rgba(0,212,255,.1)":"none",border:`1px solid ${open?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,transition:"all .2s",position:"relative"}}>
        🔔
        {unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#EF4444,#DC2626)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{unread>9?"9+":unread}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute",right:0,top:46,width:340,zIndex:300,background:"linear-gradient(150deg,#0c1220,#0f1929)",border:"1px solid rgba(0,212,255,.15)",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.8)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:".1em"}}>NOTIFICATIONS {unread>0&&<span style={{color:"#EF4444"}}>· {unread} NEW</span>}</span>
            <div style={{display:"flex",gap:8}}>
              {unread>0&&<button onClick={onRead} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#00D4FF"}}>Mark all read</button>}
              {notifs.length>0&&<button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#334155"}}>Clear</button>}
            </div>
          </div>
          <div style={{maxHeight:380,overflowY:"auto"}}>
            {notifs.length===0
              ? <div style={{padding:"28px 18px",textAlign:"center",color:"#334155",fontSize:13}}><div style={{fontSize:26,marginBottom:8}}>🔕</div>No notifications yet</div>
              : notifs.slice().reverse().map(n=>{
                  const isNews=n.meta?.type==="news";
                  const from=users.find(u=>u.id===n.from_user_id);
                  return (
                    <div key={n.id} onClick={()=>handleClick(n)} style={{padding:"11px 16px",display:"flex",gap:10,alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:n.read?"transparent":"rgba(0,212,255,.05)",transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(0,212,255,.05)"}>
                      {isNews
                        ?<div style={{width:32,height:32,borderRadius:8,background:"rgba(139,92,246,.2)",border:"1px solid rgba(139,92,246,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>📰</div>
                        :<AvatarCircle user={from} size={32}/>
                      }
                      <div style={{flex:1,minWidth:0}}>
                        {isNews
                          ?<div style={{fontSize:12,color:"#C4CDD6",lineHeight:1.4,marginBottom:2}}>{n.msg}</div>
                          :<div style={{fontSize:12,color:"#C4CDD6",lineHeight:1.4}}><span style={{fontWeight:700,color:"#E2E8F0"}}>{from?.display_name||"Someone"}</span> {n.msg}</div>
                        }
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                          <span style={{fontSize:10,color:"#334155"}}>{fmtTime(n.ts||Date.now())}</span>
                          {isNews&&<span style={{fontSize:9,color:"#8B5CF6",fontFamily:"'Orbitron',sans-serif"}}>TAP TO READ →</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                        {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"#00D4FF"}}/>}
                        {!n.read&&<button onClick={e=>{e.stopPropagation();onMarkOne&&onMarkOne(n.id);}} style={{fontSize:9,background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,cursor:"pointer",color:"#475569",padding:"2px 4px"}} title="Mark read">✓</button>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

      )}
    </div>
  );
}

function FLModal({type,user,users,navigate,onClose}){
  const ids=type==="followers"?user.followers||[]:user.following||[];
  const members=ids.map(id=>users.find(u=>u.id===id)).filter(Boolean);
  return (
    <Modal title={type==="followers"?"Followers":"Following"} onClose={onClose} width={360}>
      {members.length===0
        ? <div style={{textAlign:"center",padding:"28px 0",color:"#334155",fontSize:13}}>None yet</div>
        : <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {members.map(m=>(
              <div key={m.id} onClick={()=>{navigate("profile",m.id);onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,212,255,.07)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
                <AvatarCircle user={m} size={38}/>
                <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{m.display_name}</div><div style={{fontSize:11,color:"#475569"}}>@{m.username}</div></div>
                <span style={{fontSize:11,color:"#00D4FF"}}>→</span>
              </div>
            ))}
          </div>
      }
    </Modal>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
// ─── CARDS SYSTEM ─────────────────────────────────────────────────────────────

// 7-tier rarity system matching Real's spec
const RARITY_CFG={
  general:  {label:"General",  color:"#94A3B8",glow:"rgba(148,163,184,.25)",border:"rgba(148,163,184,.4)", anim:null,                                      mult:1.0, threshold:0},
  common:   {label:"Common",   color:"#4ADE80",glow:"rgba(74,222,128,.3)",  border:"rgba(74,222,128,.55)", anim:null,                                      mult:1.2, threshold:30},
  uncommon: {label:"Uncommon", color:"#38BDF8",glow:"rgba(56,189,248,.35)", border:"rgba(56,189,248,.6)",  anim:"rarePulse 3s ease-in-out infinite",        mult:1.4, threshold:90},
  rare:     {label:"Rare",     color:"#818CF8",glow:"rgba(129,140,248,.4)", border:"rgba(129,140,248,.7)", anim:"rarePulse 2.5s ease-in-out infinite",      mult:1.6, threshold:240},
  epic:     {label:"Epic",     color:"#A855F7",glow:"rgba(168,85,247,.5)",  border:"rgba(168,85,247,.8)",  anim:"epicPulse 2s ease-in-out infinite",        mult:2.0, threshold:540},
  legendary:{label:"Legendary",color:"#F59E0B",glow:"rgba(245,158,11,.55)",border:"rgba(245,158,11,.85)", anim:"legendFlare 1.8s ease-in-out infinite",    mult:2.5, threshold:1140},
  mystic:   {label:"Mystic",   color:"#EC4899",glow:"rgba(236,72,153,.6)",  border:"rgba(236,72,153,.9)",  anim:"legendFlare 1.4s ease-in-out infinite",   mult:4.0, threshold:4140},
  iconic:   {label:"Iconic",   color:"#FFF",   glow:"rgba(255,255,255,.7)", border:"rgba(255,255,255,1)",  anim:"legendFlare 1.2s ease-in-out infinite",   mult:6.0, threshold:10140},
};

function getCardRarityFromTotal(total){
  const tiers=["iconic","mystic","legendary","epic","rare","uncommon","common","general"];
  for(const t of tiers){if((total||0)>=RARITY_CFG[t].threshold)return t;}
  return "general";
}
function getPlayRarity(r){
  if(r>=10)return"legendary";
  if(r>=7) return"epic";
  if(r>=4) return"rare";
  if(r>=2) return"uncommon";
  return"common";
}
function nextRarityThreshold(total){
  const order=["general","common","uncommon","rare","epic","legendary","mystic","iconic"];
  const cur=getCardRarityFromTotal(total);
  const idx=order.indexOf(cur);
  if(idx>=order.length-1)return null;
  return {next:order[idx+1],threshold:RARITY_CFG[order[idx+1]].threshold,needed:RARITY_CFG[order[idx+1]].threshold-(total||0)};
}

const PACK_DEFS={
  starter:   {name:"Starter Pack",   emoji:"🎁",cost:100,playCount:3, perfCount:0,maxDaily:3,  desc:"3 plays from the season · great to start"},
  general:   {name:"General Pack",   emoji:"🎒",cost:200,playCount:5, perfCount:1,maxDaily:5,  desc:"5 plays + 1 performance · best value"},
  yesterday: {name:"Yesterday Pack", emoji:"📅",cost:250,playCount:5, perfCount:0,maxDaily:3,  desc:"5 plays from yesterday's MLB games"},
  player:    {name:"Player Pack",    emoji:"👤",cost:200,playCount:3, perfCount:0,maxDaily:999,desc:"3 plays from a specific player"},
  team:      {name:"Team Pack",      emoji:"⚾",cost:300,playCount:3, perfCount:1,maxDaily:999,desc:"3 plays + 1 performance from your team"},
};
const PACK_ODDS={
  starter:   {common:.55,uncommon:.28,rare:.12,epic:.04,legendary:.01},
  general:   {common:.40,uncommon:.30,rare:.18,epic:.09,legendary:.03},
  yesterday: {common:.38,uncommon:.30,rare:.20,epic:.09,legendary:.03},
  player:    {common:.42,uncommon:.30,rare:.17,epic:.08,legendary:.03},
  team:      {common:.38,uncommon:.28,rare:.20,epic:.10,legendary:.04},
};
const TEAM_TIERS=[10,20,50,100,200,500];

// Official MLB team logo helper
function mlbTeamLogo(teamId){return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;}
function mlbPlayerHeadshot(mlbPlayerId){return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/${mlbPlayerId}/headshot/67/current`;}

const MLB_TEAMS_LIST=[
  {id:"108",name:"Los Angeles Angels",      abbr:"LAA",emoji:"😇"},
  {id:"109",name:"Arizona Diamondbacks",    abbr:"ARI",emoji:"🐍"},
  {id:"110",name:"Baltimore Orioles",       abbr:"BAL",emoji:"🐦"},
  {id:"111",name:"Boston Red Sox",          abbr:"BOS",emoji:"🧦"},
  {id:"112",name:"Chicago Cubs",            abbr:"CHC",emoji:"🐻"},
  {id:"113",name:"Cincinnati Reds",         abbr:"CIN",emoji:"🔴"},
  {id:"114",name:"Cleveland Guardians",     abbr:"CLE",emoji:"🛡️"},
  {id:"115",name:"Colorado Rockies",        abbr:"COL",emoji:"⛰️"},
  {id:"116",name:"Detroit Tigers",          abbr:"DET",emoji:"🐯"},
  {id:"117",name:"Houston Astros",          abbr:"HOU",emoji:"🚀"},
  {id:"118",name:"Kansas City Royals",      abbr:"KC", emoji:"👑"},
  {id:"119",name:"Los Angeles Dodgers",     abbr:"LAD",emoji:"💙"},
  {id:"120",name:"Washington Nationals",    abbr:"WSH",emoji:"🦅"},
  {id:"121",name:"New York Mets",           abbr:"NYM",emoji:"🗽"},
  {id:"133",name:"Oakland Athletics",       abbr:"OAK",emoji:"🐘"},
  {id:"134",name:"Pittsburgh Pirates",      abbr:"PIT",emoji:"☠️"},
  {id:"135",name:"San Diego Padres",        abbr:"SD", emoji:"🏖️"},
  {id:"136",name:"Seattle Mariners",        abbr:"SEA",emoji:"🧭"},
  {id:"137",name:"San Francisco Giants",    abbr:"SF", emoji:"🌉"},
  {id:"138",name:"St. Louis Cardinals",     abbr:"STL",emoji:"🦅"},
  {id:"139",name:"Tampa Bay Rays",          abbr:"TB", emoji:"☀️"},
  {id:"140",name:"Texas Rangers",           abbr:"TEX",emoji:"⭐"},
  {id:"141",name:"Toronto Blue Jays",       abbr:"TOR",emoji:"🦅"},
  {id:"142",name:"Minnesota Twins",         abbr:"MIN",emoji:"🌙"},
  {id:"143",name:"Philadelphia Phillies",   abbr:"PHI",emoji:"🔔"},
  {id:"144",name:"Atlanta Braves",          abbr:"ATL",emoji:"🪓"},
  {id:"145",name:"Chicago White Sox",       abbr:"CWS",emoji:"⚫"},
  {id:"146",name:"Miami Marlins",           abbr:"MIA",emoji:"🐟"},
  {id:"147",name:"New York Yankees",        abbr:"NYY",emoji:"🗽"},
  {id:"158",name:"Milwaukee Brewers",       abbr:"MIL",emoji:"🍺"},
];

// No fake play generation — only real MLB Stats API data

// Stars hook
function useStars(cu){
  const[stars,setStars]=useState(0);
  const refresh=useCallback(async()=>{
    if(!cu)return;
    const rows=await sb.get("nova_stars",`?user_id=eq.${cu.id}&limit=1`);
    if(rows?.length)setStars(rows[0].balance||0);
  },[cu?.id]);
  useEffect(()=>{refresh();},[cu?.id]);

  const ensureRow=async()=>{
    const rows=await sb.get("nova_stars",`?user_id=eq.${cu.id}&limit=1`);
    if(rows?.length)return rows[0];
    const base={user_id:cu.id,balance:0,lifetime_earned:0,last_login_claim:0,login_streak:0};
    await sb.post("nova_stars",base);
    return base;
  };
  const earn=async(amount,reason)=>{
    if(!cu||amount<=0)return;
    try{
      const r=await ensureRow();
      const nb=(r.balance||0)+amount;
      await sb.patch("nova_stars",`?user_id=eq.${cu.id}`,{balance:nb,lifetime_earned:(r.lifetime_earned||0)+amount});
      setStars(nb);
      await sb.post("nova_star_log",{id:gid(),user_id:cu.id,amount,reason,ts:Date.now()});
    }catch(e){console.warn("earn stars",e);}
  };
  const spend=async(amount,reason)=>{
    if(!cu)return false;
    try{
      const r=await ensureRow();
      const bal=r.balance||0;
      if(bal<amount)return false;
      await sb.patch("nova_stars",`?user_id=eq.${cu.id}`,{balance:bal-amount});
      setStars(bal-amount);
      await sb.post("nova_star_log",{id:gid(),user_id:cu.id,amount:-amount,reason,ts:Date.now()});
      return true;
    }catch(e){return false;}
  };
  const claimDaily=async()=>{
    if(!cu)return null;
    try{
      const r=await ensureRow();
      const now=Date.now();
      const pstDay=(ts)=>{const d=new Date((ts||0)-8*3600000);return`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;};
      if(r.last_login_claim&&pstDay(r.last_login_claim)===pstDay(now))return"already_claimed";
      const streak=Math.min((r.login_streak||0)+1,999);
      const bonus=streak>=14?150:streak>=7?100:streak>=3?75:50;
      await earn(bonus,"Daily login bonus");
      await sb.patch("nova_stars",`?user_id=eq.${cu.id}`,{last_login_claim:now,login_streak:streak});
      return{stars:bonus,streak};
    }catch(e){return null;}
  };
  return{stars,refresh,earn,spend,claimDaily};
}

function StarBadge({stars,size="sm"}){
  const fs=size==="lg"?20:size==="md"?16:13;
  return(
    <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",borderRadius:8,padding:size==="lg"?"8px 14px":"4px 10px",flexShrink:0}}>
      <span style={{fontSize:fs}}>⭐</span>
      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:fs-2,fontWeight:900,color:"#F59E0B"}}>{(stars||0).toLocaleString()}</span>
    </div>
  );
}

// Card visual component
function CardDisplay({type,name,subName,headshot,totalRating=0,customName,customBorder,customBg,customEffect,onClick,size="md",pinned,serial}){
  const rarity=getCardRarityFromTotal(totalRating);
  const rc=RARITY_CFG[rarity];
  const w=size==="xs"?86:size==="sm"?118:size==="lg"?200:158;
  const h=Math.round(w*1.44);
  const borderColor=customBorder||rc.color;
  const bg=customBg||"#080d1a";
  const anim=customEffect||rc.anim;
  const[hov,setHov]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:w,height:h,borderRadius:12,border:`2px solid ${borderColor}`,background:bg,cursor:onClick?"pointer":"default",
      position:"relative",overflow:"hidden",flexShrink:0,
      boxShadow:anim?`0 0 22px ${rc.glow},0 0 6px ${rc.glow},inset 0 0 20px rgba(0,0,0,.5)`:`0 4px 20px rgba(0,0,0,.6)`,
      animation:anim||"none",transition:"transform .18s",transform:hov&&onClick?"scale(1.06)":"scale(1)"}}>
      {/* Holographic shimmer overlay for rare+ */}
      {(rarity==="epic"||rarity==="legendary"||rarity==="mystic"||rarity==="iconic")&&(
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,transparent 30%,${rc.glow} 50%,transparent 70%)`,backgroundSize:"200% 200%",animation:"shimmer 2.5s linear infinite",zIndex:2,pointerEvents:"none",mixBlendMode:"overlay"}}/>
      )}
      <div style={{height:"62%",background:`linear-gradient(175deg,${rc.glow},rgba(0,0,0,.9))`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
        {headshot
          ?<img src={headshot} style={{width:type==="team"?"70%":"100%",height:type==="team"?"70%":"100%",objectFit:type==="team"?"contain":"cover",objectPosition:"top center",padding:type==="team"?"8px":0}}
            onError={e=>{e.target.style.display="none";if(e.target.nextSibling)e.target.nextSibling.style.display="flex";}}/>
          :<span/>}
      <div style={{display:"none",fontSize:size==="xs"?22:size==="sm"?28:44,alignItems:"center",justifyContent:"center"}}>{type==="team"?"🏟️":"⚾"}</div>
      {!headshot&&<div style={{fontSize:size==="xs"?22:size==="sm"?28:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{type==="team"?"🏟️":"⚾"}</div>}
        <div style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,.85)",borderRadius:5,padding:"2px 6px",fontSize:7,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:rc.color,border:`1px solid ${rc.color}44`,zIndex:3}}>{rc.label.toUpperCase()}</div>
        {pinned&&<div style={{position:"absolute",bottom:4,right:5,fontSize:10,zIndex:3}}>📌</div>}
      </div>
      <div style={{padding:"6px 7px 5px",height:"38%",display:"flex",flexDirection:"column",justifyContent:"space-between",background:"rgba(0,0,0,.8)",position:"relative",zIndex:3}}>
        {customName&&<div style={{fontSize:7,color:"#64748B",fontFamily:"'Orbitron',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{customName}</div>}
        <div style={{fontSize:size==="xs"?8:size==="sm"?9:11,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
        {subName&&<div style={{fontSize:size==="xs"?7:9,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{subName}</div>}
        {serial&&<div style={{fontSize:7,color:rc.color,fontFamily:"'Orbitron',sans-serif",opacity:.7}}>{serial}</div>}
        <div style={{height:3,background:"rgba(255,255,255,.08)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(100,totalRating?((totalRating%100)/100)*100:0)}%`,background:`linear-gradient(90deg,${rc.color},${rc.color}66)`,borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

// Play card visual
function PlayCard({play,faceDown=false,flipped=false,onFlip,size="md",showPrestige}){
  const rarity=play?getPlayRarity(play.rating||0):"common";
  const rc=RARITY_CFG[rarity];
  const w=size==="xs"?84:size==="sm"?108:size==="lg"?168:138;
  const h=Math.round(w*1.44);
  const isPrestige=play?.prestige||false;
  const borderColor=isPrestige?"#FFD700":rc.color;
  const glowColor=isPrestige?"rgba(255,215,0,.7)":rc.glow;
  return(
    <div style={{width:w,height:h,perspective:900,flexShrink:0,cursor:faceDown&&!flipped?"pointer":"default"}} onClick={faceDown&&!flipped?onFlip:undefined}>
      <div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform .8s cubic-bezier(.4,0,.2,1)",transform:flipped||!faceDown?"rotateY(180deg)":"rotateY(0deg)"}}>
        {/* Back face */}
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",borderRadius:10,
          border:"2px solid rgba(0,212,255,.2)",background:"linear-gradient(145deg,#050c18,#0a1a30)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,
          boxShadow:"0 6px 24px rgba(0,0,0,.7)"}}>
          <div style={{fontSize:size==="sm"?22:32}}>💫</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:6,color:"#1e3a5f",letterSpacing:".15em",fontWeight:700}}>NOVA CARDS</div>
          <div style={{width:"60%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,.3),transparent)"}}/>
          <div style={{fontSize:7,color:"#0d2545",fontFamily:"'Orbitron',sans-serif"}}>2025 MLB</div>
        </div>
        {/* Front face */}
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",
          borderRadius:10,border:`2px solid ${borderColor}`,
          background:`linear-gradient(160deg,#07101f,#0d1a2e)`,overflow:"hidden",
          boxShadow:flipped?`0 0 28px ${glowColor},0 0 8px ${glowColor}`:"none",
          animation:flipped&&rc.anim?rc.anim:"none"}}>
          {isPrestige&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 20%,rgba(255,215,0,.15) 50%,transparent 80%)",backgroundSize:"200% 200%",animation:"shimmer 1.5s linear infinite",zIndex:1,pointerEvents:"none"}}/>}
          <div style={{height:"50%",background:`linear-gradient(140deg,${glowColor},rgba(0,0,0,.92))`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",padding:5,zIndex:2}}>
            <div style={{fontSize:size==="sm"?24:36,textAlign:"center"}}>{play?.emoji||"⚾"}</div>
            <div style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,.8)",borderRadius:4,padding:"1px 5px",fontSize:7,fontFamily:"'Orbitron',sans-serif",color:borderColor,fontWeight:700,border:`1px solid ${borderColor}44`}}>
              {isPrestige?"✨ PRESTIGE":rc.label.toUpperCase()}
            </div>
            <div style={{position:"absolute",top:3,left:3,background:"rgba(0,0,0,.8)",borderRadius:4,padding:"1px 5px",fontSize:8,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",fontWeight:700}}>{play?.rating||0}⭐</div>
          </div>
          <div style={{padding:"5px 6px",height:"50%",display:"flex",flexDirection:"column",gap:1,justifyContent:"space-between",zIndex:2,position:"relative"}}>
            <div style={{fontSize:size==="sm"?8:10,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",lineHeight:1.15,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{play?.playerName||"—"}</div>
            <div style={{fontSize:size==="sm"?7:8,color:borderColor,fontFamily:"'Orbitron',sans-serif",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{play?.teamName||""}{play?.opponent?` vs ${play.opponent}`:""}</div>
            {size!=="xs"&&play?.pitcherName&&play.pitcherName!=="Unknown"&&<div style={{fontSize:7,color:"#475569",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>P: {play.pitcherName}</div>}
            {size!=="xs"&&play?.inning&&<div style={{fontSize:7,color:"#334155"}}>{play.inning}{play.rbi>0?` · ${play.rbi} RBI`:""}</div>}
            <div style={{fontSize:size==="sm"?7:8,color:"#64748B",lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:size==="xs"?1:2,WebkitBoxOrient:"vertical"}}>{play?.description||""}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:7,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{play?.serial||""}</div>
              <div style={{fontSize:7,color:"#334155"}}>{play?.gameDate||`MLB ${play?.season||2025}`}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EPIC PACK OPENING ANIMATION ─────────────────────────────────────────────
function PackOpenModal({pack,plays,onClose,onKeep}){
  const mob=useIsMobile();
  // Phases: "tear" | "fanout" | "reveal" | "done"
  const[phase,setPhase]=useState("tear");
  const[tearPct,setTearPct]=useState(0);
  const[activeIdx,setActiveIdx]=useState(-1); // which card is selected/expanded
  const[flipped,setFlipped]=useState([]); // indices flipped
  const[particleKey,setParticleKey]=useState(0);

  // Tear animation on mount
  useEffect(()=>{
    let pct=0;
    const t=setInterval(()=>{
      pct+=3;
      setTearPct(pct);
      if(pct>=100){
        clearInterval(t);
        setTimeout(()=>setPhase("fanout"),300);
      }
    },20);
    return()=>clearInterval(t);
  },[]);

  const handleCardClick=(i)=>{
    if(phase!=="reveal")return;
    if(flipped.includes(i))return; // already revealed
    setActiveIdx(i);
    setFlipped(p=>[...p,i]);
    setParticleKey(k=>k+1);
    // If last card, trigger done after delay
    if(flipped.length+1>=plays.length){
      setTimeout(()=>setPhase("done"),1200);
    }
  };

  const revealAll=()=>{
    const all=plays.map((_,i)=>i);
    setFlipped(all);
    setParticleKey(k=>k+1);
    setTimeout(()=>setPhase("done"),1400);
  };

  const legendCount=plays.filter(p=>p.rarity==="legendary").length;
  const epicCount=plays.filter(p=>p.rarity==="epic").length;
  const mysticCount=plays.filter(p=>p.rarity==="mystic").length;

  // Colors for rarity particle bursts
  const getParticleColor=(idx)=>{
    const p=plays[idx];if(!p)return"#00D4FF";
    return RARITY_CFG[p.rarity||"common"].color;
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:600,overflow:"hidden"}}>
      {/* BG */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,#0a1628 0%,#020610 100%)"}}/>

      {/* Floating particles always */}
      {[...Array(20)].map((_,i)=>(
        <div key={i} style={{position:"absolute",width:2,height:2,borderRadius:"50%",background:`hsl(${(i*37)%360},80%,65%)`,
          left:`${(i*13.7)%100}%`,top:`${(i*7.3+10)%90}%`,
          animation:`float ${2+i%3}s ${i*0.15}s ease-in-out infinite alternate`,opacity:.3,pointerEvents:"none"}}/>
      ))}

      {/* PHASE: TEAR */}
      {phase==="tear"&&(
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
          <div style={{fontSize:mob?13:18,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".12em",marginBottom:10,fontWeight:900}}>
            {pack.emoji} {pack.name.toUpperCase()}
          </div>
          {/* Pack visual */}
          <div style={{position:"relative",width:mob?160:200,height:mob?220:280}}>
            {/* Pack body */}
            <div style={{width:"100%",height:`${100-tearPct}%`,background:"linear-gradient(160deg,#0d1f3c,#1a3060)",border:"2px solid rgba(0,212,255,.4)",borderRadius:14,overflow:"hidden",transition:"height .02s",position:"relative"}}>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                <div style={{fontSize:mob?40:52}}>{pack.emoji}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:900,color:"#00D4FF",letterSpacing:".1em",textAlign:"center",padding:"0 10px"}}>{pack.name.toUpperCase()}</div>
                <div style={{fontSize:mob?9:11,color:"#334155"}}>{plays.length} cards inside</div>
              </div>
              {/* Rip line */}
              {tearPct>5&&(
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,#00D4FF,transparent)`,animation:"shimmer 0.5s linear infinite"}}/>
              )}
            </div>
            {/* Ripping particles */}
            {tearPct>20&&[...Array(12)].map((_,i)=>(
              <div key={i} style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#00D4FF",
                left:`${15+(i*7)%70}%`,bottom:`${90-tearPct}%`,
                transform:`translate(${(i%3-1)*20}px,${-20-(i*5)}px)`,
                opacity:1-tearPct/100,transition:"all .1s",pointerEvents:"none"}}/>
            ))}
          </div>
          <div style={{fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginTop:8}}>
            {tearPct<50?"TEARING OPEN...":tearPct<90?"ALMOST...":"READY!"}
          </div>
        </div>
      )}

      {/* PHASE: FANOUT + REVEAL */}
      {(phase==="fanout"||phase==="reveal"||phase==="done")&&(
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:mob?16:30}}>
          {/* Header */}
          <div style={{textAlign:"center",marginBottom:mob?12:16,zIndex:10}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?13:18,fontWeight:900,color:"#00D4FF",letterSpacing:".08em"}}>{pack.emoji} {pack.name.toUpperCase()}</div>
            {phase==="reveal"&&flipped.length<plays.length&&(
              <div style={{fontSize:10,color:"#334155",marginTop:4,fontFamily:"'Orbitron',sans-serif"}}>
                TAP A CARD TO REVEAL · {flipped.length}/{plays.length}
              </div>
            )}
            {phase==="done"&&(legendCount>0||epicCount>0||mysticCount>0)&&(
              <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
                {mysticCount>0&&<div style={{padding:"4px 14px",borderRadius:20,background:"rgba(236,72,153,.15)",border:"1px solid rgba(236,72,153,.5)",fontSize:11,color:"#EC4899",fontFamily:"'Orbitron',sans-serif",fontWeight:700,animation:"legendFlare 1.4s ease-in-out infinite"}}>✨ {mysticCount}x MYSTIC!</div>}
                {legendCount>0&&<div style={{padding:"4px 14px",borderRadius:20,background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.5)",fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700,animation:"legendFlare 1.8s ease-in-out infinite"}}>🏆 {legendCount}x LEGENDARY!</div>}
                {epicCount>0&&<div style={{padding:"4px 14px",borderRadius:20,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.5)",fontSize:11,color:"#A855F7",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>⚡ {epicCount}x EPIC!</div>}
              </div>
            )}
          </div>

          {/* Cards area */}
          <div style={{
            display:"flex",flexWrap:"wrap",gap:mob?8:12,justifyContent:"center",
            maxWidth:mob?360:760,padding:"0 12px",
            animation:phase==="fanout"?"cardFanOut .6s ease both":"none",
            flex:1,alignContent:"center",
          }}>
            {plays.map((p,i)=>{
              const isFlipped=flipped.includes(i);
              const isActive=activeIdx===i;
              const isReady=phase==="reveal"||phase==="done";
              const rc=RARITY_CFG[p.rarity||"common"];
              return(
                <div key={i} style={{
                  position:"relative",
                  animation:phase==="fanout"?`cardDrop .5s ${i*0.08}s cubic-bezier(.34,1.56,.64,1) both`:"none",
                  transform:isActive&&isFlipped?`scale(1.12)`:"scale(1)",
                  transition:"transform .3s",
                  zIndex:isActive?20:10,
                }}>
                  <PlayCard play={p} faceDown={isReady} flipped={isFlipped} onFlip={()=>handleCardClick(i)} size={mob?"sm":"md"}/>
                  {/* Particle burst on reveal */}
                  {isFlipped&&isActive&&(
                    <div key={particleKey} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:30}}>
                      {[...Array(16)].map((_,j)=>{
                        const angle=(j/16)*360;
                        const dist=40+Math.random()*30;
                        return(
                          <div key={j} style={{
                            position:"absolute",top:"50%",left:"50%",
                            width:j%3===0?6:4,height:j%3===0?6:4,
                            borderRadius:"50%",background:rc.color,
                            animation:`burst .6s ${j*0.02}s ease-out forwards`,
                            "--angle":`${angle}deg`,"--dist":`${dist}px`,
                            transformOrigin:"center",
                          }}/>
                        );
                      })}
                    </div>
                  )}
                  {/* Glow ring for high rarity reveal */}
                  {isFlipped&&(p.rarity==="legendary"||p.rarity==="epic"||p.rarity==="mystic")&&(
                    <div style={{position:"absolute",inset:-4,borderRadius:14,border:`2px solid ${rc.color}`,
                      animation:`${rc.anim}`,pointerEvents:"none",zIndex:5}}/>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",padding:"16px 12px",marginTop:"auto",zIndex:20}}>
            {phase==="reveal"&&flipped.length<plays.length&&(
              <button onClick={revealAll} style={{padding:"10px 24px",borderRadius:10,background:"rgba(0,212,255,.1)",border:"1px solid rgba(0,212,255,.35)",color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Reveal All</button>
            )}
            {phase==="done"&&(
              <button onClick={onKeep} style={{padding:"13px 32px",borderRadius:10,background:"linear-gradient(135deg,#00D4FF,#7C3AED)",border:"none",color:"#fff",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,cursor:"pointer",letterSpacing:".05em",boxShadow:"0 4px 20px rgba(0,212,255,.4)"}}>Add to Collection →</button>
            )}
            <button onClick={onClose} style={{padding:"10px 20px",borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:11,cursor:"pointer"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Set phase to reveal after fanout animation completes
// We need a wrapper that transitions fanout→reveal after animation
function PackOpenModalWrapper({pack,plays,onClose,onKeep}){
  const[ready,setReady]=useState(false);
  useEffect(()=>{
    // fanout phase duration ~ 0.6s base + plays.length*0.08s + 0.4s buffer
    const delay=600+(plays.length*80)+500;
    const t=setTimeout(()=>setReady(true),delay);
    return()=>clearTimeout(t);
  },[plays.length]);
  return <PackOpenModal pack={pack} plays={plays} onClose={onClose} onKeep={onKeep} _ready={ready}/>;
}

// Card customize modal
function CardCustomizeModal({card,onSave,onClose}){
  const[customName,setCustomName]=useState(card.custom_name||"");
  const[customHeadshot,setCustomHeadshot]=useState(card.custom_headshot||"");
  const[border,setBorder]=useState(card.custom_border||"");
  const[bg,setBg]=useState(card.custom_bg||"");
  const[effect,setEffect]=useState(card.custom_effect||"");
  const BORDERS=["","#00D4FF","#A855F7","#F59E0B","#EF4444","#22C55E","#F97316","#EC4899","#fff","#94A3B8","#FFD700"];
  const BGS=["","#080d1a","#0a1a0a","#1a0808","#080a1a","#1a1208","#0a0818","#181818","#1a0a14"];
  const EFFS=[["","None"],["rarePulse 2.5s ease-in-out infinite","Blue Glow"],["epicPulse 2s ease-in-out infinite","Purple Pulse"],["legendFlare 1.8s ease-in-out infinite","Gold Flare"],["legendFlare 1.4s ease-in-out infinite","Mystic Flare"]];
  return(
    <Modal title="✏️ Customize Card" onClose={onClose} width={440}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
        <CardDisplay type={card.card_type} name={card.card_name} headshot={customHeadshot||card.headshot_url} totalRating={card.total_play_rating||0} customName={customName||undefined} customBorder={border||undefined} customBg={bg||undefined} customEffect={effect||undefined} size="md" serial={card.serial}/>
      </div>
      <div style={{marginBottom:14}}><Lbl>Custom Photo</Lbl>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <label style={{padding:"7px 14px",borderRadius:8,background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.25)",color:"#00D4FF",fontSize:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0}}>
            📷 Upload Photo
            <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
              const file=e.target.files?.[0];if(!file)return;
              const reader=new FileReader();
              reader.onload=(ev)=>setCustomHeadshot(ev.target.result);
              reader.readAsDataURL(file);
            }}/>
          </label>
          {customHeadshot&&<div style={{fontSize:10,color:"#22C55E"}}>✓ Photo selected</div>}
          {customHeadshot&&<button onClick={()=>setCustomHeadshot("")} style={{background:"none",border:"none",color:"#EF4444",fontSize:11,cursor:"pointer"}}>✕ Remove</button>}
        </div>
        <div style={{fontSize:10,color:"#334155",marginTop:4}}>Upload any photo to replace the default headshot/logo on this card</div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Card Nickname</Lbl>
        <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="Custom nickname…" maxLength={28}/>
        <div style={{fontSize:10,color:"#334155",marginTop:3}}>Real name always shows below</div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Border Color</Lbl>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {BORDERS.map((c,i)=><button key={i} onClick={()=>setBorder(c)} style={{width:26,height:26,borderRadius:6,background:c||"rgba(255,255,255,.06)",border:`2px solid ${border===c?"#00D4FF":"rgba(255,255,255,.12)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{!c&&<span style={{fontSize:9,color:"#334155"}}>✕</span>}</button>)}
        </div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Background</Lbl>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {BGS.map((c,i)=><button key={i} onClick={()=>setBg(c)} style={{width:26,height:26,borderRadius:6,background:c||"rgba(255,255,255,.06)",border:`2px solid ${bg===c?"#00D4FF":"rgba(255,255,255,.12)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{!c&&<span style={{fontSize:9,color:"#334155"}}>✕</span>}</button>)}
        </div>
      </div>
      <div style={{marginBottom:22}}><Lbl>Card Effect</Lbl>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {EFFS.map(([e,l])=><button key={l} onClick={()=>setEffect(e)} style={{padding:"6px 12px",borderRadius:8,background:effect===e?"rgba(0,212,255,.12)":"rgba(255,255,255,.04)",border:`1px solid ${effect===e?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,color:effect===e?"#00D4FF":"#64748B",fontSize:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>{l}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>onSave({custom_name:customName,custom_headshot:customHeadshot,custom_border:border,custom_bg:bg,custom_effect:effect})} style={{flex:1}}>Save Card</Btn>
        <Btn variant="muted" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// Prestige modal — combine 3 identical plays
function PrestigeModal({plays,onPrestige,onClose}){
  const[sel,setSel]=useState([]);
  // group plays by description+playerName
  const groups=useMemo(()=>{
    const map={};
    plays.forEach(p=>{
      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
      if(!pd)return;
      const key=`${pd.playerName}__${pd.description}__${pd.rating}`;
      if(!map[key])map[key]=[];
      map[key].push({...p,_pd:pd});
    });
    return Object.entries(map).filter(([,v])=>v.length>=3);
  },[plays]);

  const doPrestige=()=>{
    if(sel.length===0)return;
    const [key]=sel;
    const group=groups.find(([k])=>k===key);
    if(!group)return;
    onPrestige(group[1].slice(0,3),key);
  };

  return(
    <Modal title="✨ Prestige — Combine 3 Identical Plays" onClose={onClose} width={500}>
      <div style={{fontSize:12,color:"#64748B",marginBottom:16}}>Combine 3 of the same play to create a Prestige card with 3× the rating and a gold border.</div>
      {groups.length===0&&<Empty icon="✨" msg="No prestige-ready plays yet — collect 3 of the same play!"/>}
      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:320,overflowY:"auto"}}>
        {groups.map(([key,items])=>{
          const pd=items[0]._pd;
          const rc=RARITY_CFG[pd.rarity||"common"];
          const isSel=sel[0]===key;
          return(
            <div key={key} onClick={()=>setSel(isSel?[]:[key])} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:isSel?"rgba(255,215,0,.08)":"rgba(255,255,255,.03)",border:`1px solid ${isSel?"rgba(255,215,0,.5)":rc.color+"33"}`,cursor:"pointer",transition:"all .15s"}}>
              <div style={{fontSize:22}}>{pd.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0"}}>{pd.playerName}</div>
                <div style={{fontSize:10,color:rc.color,marginBottom:2}}>{pd.description}</div>
                <div style={{fontSize:9,color:"#475569"}}>{rc.label} · {pd.rating}⭐ → {pd.rating*3}⭐ after prestige</div>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#F59E0B"}}>{items.length}×</div>
                <div style={{fontSize:8,color:"#475569"}}>copies</div>
              </div>
            </div>
          );
        })}
      </div>
      {sel.length>0&&(
        <div style={{marginTop:16}}>
          <Btn onClick={doPrestige} style={{width:"100%"}}>✨ Prestige This Play (3× rating, gold border)</Btn>
        </div>
      )}
    </Modal>
  );
}

// ── Cards sub-tabs ───────────────────────────────────────────────────────────

function CardMarketTab({cu,stars,myCards,onBuy}){
  const mob=useIsMobile();
  const[type,setType]=useState("player");
  const[q,setQ]=useState("");
  const[results,setResults]=useState([]);
  const[searching,setSearching]=useState(false);
  const ownedIds=useMemo(()=>new Set(myCards.map(c=>c.card_def_id)),[myCards]);

  useEffect(()=>{
    if(type!=="player"||q.length<2){setResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      try{
        const r=await fetch(`/api/hyperbeam?search=${encodeURIComponent(q)}&sport=mlb`);
        const d=await r.json();
        setResults((d.athletes||[]).map(a=>({
          id:`mlb_player_${a.id}`,player_id:a.id,type:"player",
          name:a.name,team_name:a.team,position:a.position,
          headshot_url:mlbPlayerHeadshot(a.id),
          cost:200,
        })));
      }catch(e){setResults([]);}
      setSearching(false);
    },400);
    return()=>clearTimeout(t);
  },[q,type]);

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {[["player","👤 Players","200 ⭐"],["team","🏟️ Teams","800 ⭐"]].map(([t,l,cost])=>(
          <button key={t} onClick={()=>{setType(t);setResults([]);setQ("");}} style={{padding:"8px 18px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,border:`1px solid ${type===t?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:type===t?"#00D4FF":"#64748B"}}>
            {l} <span style={{fontSize:9,color:"#334155"}}>{cost}</span>
          </button>
        ))}
      </div>
      {type==="player"&&(
        <>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search any active MLB player…" style={{marginBottom:14}}/>
          {searching&&<div style={{textAlign:"center",padding:28,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Searching MLB roster…</div>}
          {!searching&&q.length>=2&&!results.length&&<Empty icon="🔍" msg="No players found — try full name"/>}
          {q.length<2&&<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:36,marginBottom:10}}>⚾</div><div style={{color:"#334155",fontSize:13}}>Search any active MLB player</div><div style={{color:"#1e3a5f",fontSize:11,marginTop:4}}>200 ⭐ per player card</div></div>}
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(185px,1fr))",gap:12}}>
            {results.map(card=>{
              const owned=ownedIds.has(card.id);
              return(
                <Card key={card.id} style={{padding:"14px 12px 16px",textAlign:"center"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                    <CardDisplay type="player" name={card.name} subName={card.team_name} headshot={card.headshot_url} totalRating={0} size="sm"/>
                  </div>
                  <div style={{fontSize:11,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",marginBottom:2}}>{card.name}</div>
                  <div style={{fontSize:10,color:"#475569",marginBottom:10}}>{card.team_name}{card.position?` · ${card.position}`:""}</div>
                  {owned
                    ?<div style={{padding:"7px",borderRadius:8,background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",fontSize:10,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✓ OWNED</div>
                    :<button onClick={()=>onBuy(card)} disabled={!cu||stars<200} style={{width:"100%",padding:"8px",borderRadius:8,background:cu&&stars>=200?"rgba(0,212,255,.12)":"rgba(255,255,255,.04)",border:`1px solid ${cu&&stars>=200?"rgba(0,212,255,.35)":"rgba(255,255,255,.08)"}`,color:cu&&stars>=200?"#00D4FF":"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,cursor:cu&&stars>=200?"pointer":"not-allowed"}}>
                      {!cu?"Sign in to buy":"Buy · 200 ⭐"}
                    </button>
                  }
                </Card>
              );
            })}
          </div>
        </>
      )}
      {type==="team"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(172px,1fr))",gap:12}}>
          {MLB_TEAMS_LIST.map(team=>{
            const defId=`mlb_team_${team.id}`;
            const owned=ownedIds.has(defId);
            const rc=RARITY_CFG["general"];
            return(
              <Card key={team.id} style={{padding:"16px 14px",textAlign:"center"}}>
                <div style={{width:48,height:48,margin:"0 auto 7px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <img src={mlbTeamLogo(team.id)} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
                  <div style={{display:"none",fontSize:28,alignItems:"center",justifyContent:"center"}}>{team.emoji}</div>
                </div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",marginBottom:2,lineHeight:1.3}}>{team.name}</div>
                <div style={{fontSize:10,color:"#475569",marginBottom:12}}>{team.abbr}</div>
                {owned
                  ?<div style={{padding:"6px",borderRadius:8,background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",fontSize:10,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✓ OWNED</div>
                  :<button onClick={()=>onBuy({id:defId,type:"team",player_id:null,name:team.name,team_name:team.name,headshot_url:mlbTeamLogo(team.id),cost:800})} disabled={!cu||stars<800} style={{width:"100%",padding:"8px",borderRadius:8,background:cu&&stars>=800?"rgba(168,85,247,.12)":"rgba(255,255,255,.04)",border:`1px solid ${cu&&stars>=800?"rgba(168,85,247,.35)":"rgba(255,255,255,.08)"}`,color:cu&&stars>=800?"#A855F7":"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:cu&&stars>=800?"pointer":"not-allowed"}}>
                    {!cu?"Sign in":"Buy · 800 ⭐"}
                  </button>
                }
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MyCardsTab({cu,cards,plays,onCustomize,onPin,onApply}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const unapplied=useMemo(()=>plays.filter(p=>!p.applied_to),[plays]);
  if(!cu)return<Empty icon="🃏" msg="Sign in to see your cards"/>;
  if(!cards.length)return<div style={{textAlign:"center",padding:60}}><div style={{fontSize:44,marginBottom:12}}>🃏</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#475569"}}>No cards yet</div><div style={{fontSize:11,color:"#334155",marginTop:6}}>Head to Market · Player 200⭐ · Team 800⭐</div></div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {cards.map(card=>{
        const rarity=getCardRarityFromTotal(card.total_play_rating||0);
        const rc=RARITY_CFG[rarity];
        const nxt=nextRarityThreshold(card.total_play_rating||0);
        const isSelected=sel===card.id;
        return(
          <Card key={card.id} style={{padding:14,border:isSelected?"1px solid rgba(0,212,255,.5)":undefined}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <CardDisplay type={card.card_type} name={card.card_name} headshot={card.headshot_url} totalRating={card.total_play_rating||0} customName={card.custom_name||undefined} customBorder={card.custom_border||undefined} customBg={card.custom_bg||undefined} customEffect={card.custom_effect||undefined} size="sm" pinned={card.pinned} serial={card.serial} headshot={card.custom_headshot||card.headshot_url}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",marginBottom:1}}>{card.custom_name||card.card_name}</div>
                {card.custom_name&&<div style={{fontSize:10,color:"#475569",marginBottom:4}}>{card.card_name}</div>}
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{padding:"2px 8px",borderRadius:10,background:rc.color+"18",border:`1px solid ${rc.color}33`,fontSize:9,fontFamily:"'Orbitron',sans-serif",color:rc.color,fontWeight:700}}>{rc.label}</span>
                  <span style={{fontSize:10,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>{rc.mult}x earnings</span>
                </div>
                <div style={{fontSize:10,color:"#475569",marginBottom:8}}>
                  <div>Rating: {card.total_play_rating||0} pts</div>
                  {nxt&&<div style={{fontSize:9,color:"#334155",marginTop:2}}>{nxt.needed} pts to {nxt.next}</div>}
                  {nxt&&(
                    <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden",marginTop:4}}>
                      <div style={{height:"100%",width:`${Math.min(100,((card.total_play_rating||0)-RARITY_CFG[rarity].threshold)/(nxt.threshold-RARITY_CFG[rarity].threshold)*100)}%`,background:`linear-gradient(90deg,${rc.color},${rc.color}66)`,borderRadius:2}}/>
                    </div>
                  )}
                  {card.serial&&<div style={{fontSize:9,color:rc.color,marginTop:3,fontFamily:"'Orbitron',sans-serif"}}>{card.serial}</div>}
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  <button onClick={()=>onCustomize(card)} style={{padding:"5px 10px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",color:"#94A3B8",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>✏️ Edit</button>
                  <button onClick={()=>onPin(card)} style={{padding:"5px 10px",borderRadius:6,background:card.pinned?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",border:`1px solid ${card.pinned?"rgba(0,212,255,.35)":"rgba(255,255,255,.09)"}`,color:card.pinned?"#00D4FF":"#94A3B8",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>{card.pinned?"📌 Pinned":"📌 Pin"}</button>
                  {unapplied.length>0&&<button onClick={()=>setSel(isSelected?null:card.id)} style={{padding:"5px 10px",borderRadius:6,background:isSelected?"rgba(168,85,247,.12)":"rgba(255,255,255,.04)",border:`1px solid ${isSelected?"rgba(168,85,247,.4)":"rgba(255,255,255,.09)"}`,color:isSelected?"#A855F7":"#94A3B8",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>⚡ Level Up</button>}
                </div>
              </div>
            </div>
            {isSelected&&unapplied.length>0&&(
              <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:12}}>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:8,letterSpacing:".1em"}}>APPLY A PLAY:</div>
                <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>
                  {unapplied.slice(0,15).map(p=>{
                    const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
                    const pr=getPlayRarity(pd?.rating||0);const prc=RARITY_CFG[pr];
                    return(
                      <div key={p.id} style={{flexShrink:0,cursor:"pointer",textAlign:"center"}} onClick={()=>{onApply(p,card);setSel(null);}}>
                        <PlayCard play={pd} size="xs"/>
                        <div style={{fontSize:8,color:prc.color,fontFamily:"'Orbitron',sans-serif",marginTop:2}}>+{pd?.rating||0}pts</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function PackShopTab({cu,stars,loading,onOpen,myTeamCard}){
  const mob=useIsMobile();
  const[selPlayer,setSelPlayer]=useState("");
  const[playerSearch,setPlayerSearch]=useState("");
  const[playerResults,setPlayerResults]=useState([]);
  const[searching,setSearching]=useState(false);

  useEffect(()=>{
    if(playerSearch.length<2){setPlayerResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      try{const r=await fetch(`/api/hyperbeam?search=${encodeURIComponent(playerSearch)}&sport=mlb`);const d=await r.json();setPlayerResults(d.athletes||[]);}catch{setPlayerResults([]);}
      setSearching(false);
    },400);
    return()=>clearTimeout(t);
  },[playerSearch]);

  return(
    <div style={{maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      {!cu&&<Empty icon="🎁" msg="Sign in to open packs"/>}
      {cu&&Object.entries(PACK_DEFS).map(([key,pack])=>{
        const isTeamPack=key==="team";
        const isPlayerPack=key==="player";
        if(isTeamPack&&!myTeamCard)return(
          <Card key={key} style={{padding:18,opacity:.5}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:32}}>{pack.emoji}</div>
              <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#E2E8F0"}}>{pack.name}</div>
              <div style={{fontSize:11,color:"#EF4444",marginTop:2}}>Requires owning a team card first</div></div>
            </div>
          </Card>
        );
        const canAfford=stars>=pack.cost;
        const odds=PACK_ODDS[key];
        return(
          <Card key={key} style={{padding:18}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{fontSize:32,flexShrink:0}}>{pack.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#E2E8F0",marginBottom:2}}>{pack.name}</div>
                <div style={{fontSize:11,color:"#475569"}}>{pack.desc}</div>
                {isTeamPack&&myTeamCard&&<div style={{fontSize:10,color:"#A855F7",marginTop:2}}>Team: {myTeamCard.card_name}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:17,fontWeight:900,color:"#F59E0B"}}>{pack.cost}⭐</div>
                <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{pack.maxDaily<999?`Max ${pack.maxDaily}x/day`:"Unlimited"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
              {Object.entries(odds).map(([r,pct])=>{const rc=RARITY_CFG[r];return<div key={r} style={{padding:"2px 9px",borderRadius:14,background:rc.color+"14",border:`1px solid ${rc.color}33`,fontSize:9,color:rc.color,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{rc.label} {Math.round(pct*100)}%</div>;})}
            </div>
            {isPlayerPack&&(
              <div style={{marginBottom:12}}>
                <input value={playerSearch} onChange={e=>setPlayerSearch(e.target.value)} placeholder="Search player for this pack…" style={{marginBottom:6}}/>
                {searching&&<div style={{fontSize:10,color:"#334155"}}>Searching…</div>}
                {playerResults.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:140,overflowY:"auto"}}>
                    {playerResults.map(a=>(
                      <button key={a.id} onClick={()=>{setSelPlayer(a.id);setPlayerSearch(a.name);setPlayerResults([]);}} style={{padding:"6px 10px",borderRadius:7,background:selPlayer===a.id?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",border:`1px solid ${selPlayer===a.id?"rgba(0,212,255,.3)":"rgba(255,255,255,.07)"}`,color:"#E2E8F0",fontSize:11,cursor:"pointer",textAlign:"left"}}>
                        {a.name} <span style={{color:"#475569"}}>· {a.team}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={()=>onOpen(key,isPlayerPack?selPlayer:null,myTeamCard)} disabled={!canAfford||loading||(isPlayerPack&&!selPlayer)} style={{width:"100%",padding:"12px",borderRadius:10,background:canAfford&&!loading&&(!isPlayerPack||selPlayer)?"linear-gradient(135deg,#00D4FF,#7C3AED)":"rgba(255,255,255,.05)",border:"none",color:canAfford&&!loading&&(!isPlayerPack||selPlayer)?"#fff":"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,cursor:canAfford&&!loading&&(!isPlayerPack||selPlayer)?"pointer":"not-allowed",letterSpacing:".04em",transition:"all .2s"}}>
              {loading?"⟳ Opening...":canAfford?`Open ${pack.name}`:isPlayerPack&&!selPlayer?"Select a player first":`Need ${pack.cost-stars} more ⭐`}
            </button>
          </Card>
        );
      })}
    </div>
  );
}

function MyPlaysTab({cu,plays,cards,onApply,onPrestige,onPinPlay}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[showPrestige,setShowPrestige]=useState(false);
  const unapplied=plays.filter(p=>!p.applied_to);
  const applied=plays.filter(p=>p.applied_to);
  const prestigeReady=useMemo(()=>{
    const map={};
    plays.forEach(p=>{const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;if(!pd)return;const key=`${pd.playerName}__${pd.description}__${pd.rating}`;map[key]=(map[key]||0)+1;});
    return Object.values(map).some(v=>v>=3);
  },[plays]);
  if(!cu)return<Empty icon="⚡" msg="Sign in to see your plays"/>;
  if(!plays.length)return<div style={{textAlign:"center",padding:60}}><div style={{fontSize:44,marginBottom:12}}>⚡</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#475569"}}>No play cards yet</div><div style={{fontSize:11,color:"#334155",marginTop:6}}>Open packs to get real MLB plays</div></div>;
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{fontSize:11,color:"#475569"}}>{unapplied.length} unused · {applied.length} applied</div>
        {prestigeReady&&<button onClick={()=>setShowPrestige(true)} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.4)",color:"#FFD700",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,cursor:"pointer",animation:"starPop .4s ease"}}>✨ Prestige Ready!</button>}
      </div>
      {unapplied.length>0&&(
        <>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#22C55E",letterSpacing:".14em",marginBottom:12}}>⚡ UNUSED · {unapplied.length}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:28}}>
            {unapplied.map(p=>{
              const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
              const isSel=sel===p.id;
              return(
                <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,position:"relative"}}>
                  <PlayCard play={pd} size={mob?"sm":"md"}/>
                  <div style={{display:"flex",gap:4}}>
                    {cards.length>0&&<button onClick={()=>setSel(isSel?null:p.id)} style={{padding:"4px 8px",borderRadius:6,background:isSel?"rgba(168,85,247,.15)":"rgba(255,255,255,.05)",border:`1px solid ${isSel?"rgba(168,85,247,.4)":"rgba(255,255,255,.1)"}`,color:isSel?"#A855F7":"#64748B",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{isSel?"CANCEL":"APPLY"}</button>}
                    {onPinPlay&&<button onClick={()=>onPinPlay(p)} style={{padding:"4px 8px",borderRadius:6,background:p.pinned?"rgba(0,212,255,.12)":"rgba(255,255,255,.05)",border:`1px solid ${p.pinned?"rgba(0,212,255,.35)":"rgba(255,255,255,.1)"}`,color:p.pinned?"#00D4FF":"#64748B",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{p.pinned?"📌":"📌 Pin"}</button>}
                  </div>
                  {isSel&&cards.length>0&&(
                    <div style={{position:"absolute",top:"105%",left:"50%",transform:"translateX(-50%)",background:"linear-gradient(160deg,#0c1220,#10172a)",border:"1px solid rgba(168,85,247,.3)",borderRadius:10,padding:8,zIndex:100,minWidth:170,maxHeight:190,overflowY:"auto",boxShadow:"0 12px 36px rgba(0,0,0,.8)"}}>
                      <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>APPLY TO:</div>
                      {cards.map(c=>(
                        <button key={c.id} onClick={()=>{onApply(p,c);setSel(null);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",borderRadius:7,background:"none",border:"none",cursor:"pointer",textAlign:"left",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                          <span style={{fontSize:10}}>🃏</span>
                          <div><div style={{fontSize:10,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{c.card_name}</div>
                          <div style={{fontSize:9,color:"#475569"}}>{c.total_play_rating||0}pts · {RARITY_CFG[getCardRarityFromTotal(c.total_play_rating||0)].label}</div></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {applied.length>0&&(
        <>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".14em",marginBottom:12}}>✓ APPLIED · {applied.length}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,opacity:.5}}>
            {applied.map(p=>{const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;return<PlayCard key={p.id} play={pd} size="sm"/>;  })}
          </div>
        </>
      )}
      {showPrestige&&<PrestigeModal plays={plays} onClose={()=>setShowPrestige(false)} onPrestige={(trio,key)=>{onPrestige(trio);setShowPrestige(false);}}/>}
    </div>
  );
}

// Main Cards Page

// ── Collection Tab — every obtainable card, yours highlighted ─────────────────
function CollectionTab({cu,myCards,myPlays}){
  const mob=useIsMobile();
  const[section,setSection]=useState("players");
  const[q,setQ]=useState("");
  const[teamFilter,setTeamFilter]=useState(""); // abbr of selected team, "" = all
  const[ownFilter,setOwnFilter]=useState("all"); // all | owned | unowned

  const ownedCardIds=useMemo(()=>new Set(myCards.map(c=>c.card_def_id)),[myCards]);
  const allTeams=MLB_TEAMS_LIST;
  const myPlayerCards=myCards.filter(c=>c.card_type==="player");
  const myTeamCards=myCards.filter(c=>c.card_type==="team");

  // Deduplicated plays pool from user collection
  const allPlays=useMemo(()=>{
    const seen=new Map();
    myPlays.forEach(p=>{
      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
      if(!pd?.playerName)return;
      const key=`${pd.playerName}__${pd.description}`;
      if(!seen.has(key))seen.set(key,{pd,owned:true,userPlay:p});
    });
    return Array.from(seen.values());
  },[myPlays]);

  // Team dropdown shared component
  const TeamDropdown=({value,onChange,style={}})=>(
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:"#E2E8F0",fontFamily:"'Rajdhani',sans-serif",fontSize:13,padding:"8px 12px",cursor:"pointer",flex:"0 0 auto",...style}}>
      <option value="">All Teams</option>
      {allTeams.map(t=><option key={t.id} value={t.abbr}>{t.emoji} {t.name}</option>)}
    </select>
  );

  // Ownership filter tabs
  const OwnTabs=()=>(
    <div style={{display:"flex",gap:5}}>
      {[["all","All"],["owned","✅ Owned"],["unowned","🔒 Not Owned"]].map(([v,l])=>(
        <button key={v} onClick={()=>setOwnFilter(v)}
          style={{padding:"6px 12px",borderRadius:16,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
            border:`1px solid ${ownFilter===v?"rgba(0,212,255,.45)":"rgba(255,255,255,.1)"}`,
            background:ownFilter===v?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",
            color:ownFilter===v?"#00D4FF":"#64748B"}}>
          {l}
        </button>
      ))}
    </div>
  );

  // ── Filtered lists ──────────────────────────────────────────────────────────

  // Players: filter by name search + team filter (team_name stored on card)
  const filteredPlayerCards=useMemo(()=>{
    return myPlayerCards.filter(c=>{
      const nameMatch=!q||c.card_name.toLowerCase().includes(q.toLowerCase());
      const selectedTeam=allTeams.find(t=>t.abbr===teamFilter);
      const teamMatch=!teamFilter||
        (c.team_name||"").toLowerCase().includes((selectedTeam?.name||"").toLowerCase())||
        (c.team_name||"").toLowerCase().includes(teamFilter.toLowerCase());
      return nameMatch&&teamMatch;
    });
  },[myPlayerCards,q,teamFilter,allTeams]);

  // Teams: filter by name search + ownership
  const filteredTeams=useMemo(()=>{
    return allTeams.filter(t=>{
      const nameMatch=!q||t.name.toLowerCase().includes(q.toLowerCase())||t.abbr.toLowerCase().includes(q.toLowerCase());
      const owned=ownedCardIds.has(`mlb_team_${t.id}`);
      const ownMatch=ownFilter==="all"||(ownFilter==="owned"&&owned)||(ownFilter==="unowned"&&!owned);
      return nameMatch&&ownMatch;
    });
  },[allTeams,q,ownFilter,ownedCardIds]);

  // Plays: filter by name/description search + team + ownership
  const filteredPlays=useMemo(()=>{
    return allPlays.filter(({pd,owned})=>{
      const textMatch=!q||(pd.playerName||"").toLowerCase().includes(q.toLowerCase())||(pd.description||"").toLowerCase().includes(q.toLowerCase());
      const selectedTeam=allTeams.find(t=>t.abbr===teamFilter);
      const teamMatch=!teamFilter||
        (pd.teamName||"").toLowerCase().includes((selectedTeam?.name||teamFilter).toLowerCase())||
        (pd.teamName||"").toLowerCase().includes(teamFilter.toLowerCase());
      const ownMatch=ownFilter==="all"||(ownFilter==="owned"&&owned)||(ownFilter==="unowned"&&!owned);
      return textMatch&&teamMatch&&ownMatch;
    });
  },[allPlays,q,teamFilter,ownFilter,allTeams]);

  const resetFilters=()=>{setQ("");setTeamFilter("");setOwnFilter("all");};
  const hasFilters=q||teamFilter||ownFilter!=="all";

  return(
    <div>
      {/* Section tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        {[["players","👤 Players"],["teams","🏟️ Teams"],["plays","⚡ Plays"]].map(([s,l])=>(
          <button key={s} onClick={()=>{setSection(s);resetFilters();}}
            style={{padding:"7px 16px",borderRadius:20,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
              border:`1px solid ${section===s?"rgba(245,158,11,.5)":"rgba(255,255,255,.1)"}`,
              background:section===s?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",
              color:section===s?"#F59E0B":"#64748B"}}>
            {l}
            <span style={{marginLeft:5,fontSize:9,color:section===s?"#F59E0B":"#334155"}}>
              {s==="players"?`${myPlayerCards.length} owned`:s==="teams"?`${myTeamCards.length}/30`:`${allPlays.length} collected`}
            </span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder={section==="players"?"Search player name…":section==="teams"?"Search team…":"Search player or play…"}
          style={{flex:1,minWidth:160}}/>
        {/* Team dropdown — not shown for teams section (redundant) */}
        {section!=="teams"&&(
          <TeamDropdown value={teamFilter} onChange={setTeamFilter} style={{minWidth:140,maxWidth:200}}/>
        )}
        {/* Own/unowned filter for teams + plays */}
        {(section==="teams"||section==="plays")&&<OwnTabs/>}
        {hasFilters&&(
          <button onClick={resetFilters}
            style={{padding:"7px 12px",borderRadius:8,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:"#EF4444",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0}}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginBottom:12}}>
        {section==="players"&&`${filteredPlayerCards.length} PLAYER CARD${filteredPlayerCards.length!==1?"S":""}`}
        {section==="teams"&&`${filteredTeams.length} TEAM${filteredTeams.length!==1?"S":""} · ${myTeamCards.length}/30 OWNED`}
        {section==="plays"&&`${filteredPlays.length} PLAY${filteredPlays.length!==1?"S":""} · ${allPlays.length} TOTAL COLLECTED`}
        {teamFilter&&` · ${allTeams.find(t=>t.abbr===teamFilter)?.name||teamFilter}`}
      </div>

      {/* ── PLAYERS ── */}
      {section==="players"&&(
        <div>
          {!myPlayerCards.length&&(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:36,marginBottom:10}}>👤</div>
              <div style={{color:"#334155",fontSize:13,fontFamily:"'Orbitron',sans-serif"}}>No player cards yet</div>
              <div style={{color:"#1e3a5f",fontSize:11,marginTop:4}}>Head to Market · 200⭐ each</div>
            </div>
          )}
          {myPlayerCards.length>0&&filteredPlayerCards.length===0&&(
            <div style={{textAlign:"center",padding:"30px 20px",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>
              No cards match these filters
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(auto-fill,minmax(140px,1fr))",gap:mob?8:12}}>
            {filteredPlayerCards.map(card=>{
              const rarity=getCardRarityFromTotal(card.total_play_rating||0);
              const rc=RARITY_CFG[rarity];
              const nxt=nextRarityThreshold(card.total_play_rating||0);
              return(
                <div key={card.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <CardDisplay type="player" name={card.card_name} headshot={card.custom_headshot||card.headshot_url}
                    totalRating={card.total_play_rating||0} customName={card.custom_name||undefined}
                    customBorder={card.custom_border||undefined} customBg={card.custom_bg||undefined}
                    customEffect={card.custom_effect||undefined} size={mob?"sm":"md"} pinned={card.pinned} serial={card.serial}/>
                  <div style={{textAlign:"center",maxWidth:mob?90:150}}>
                    <div style={{fontSize:mob?7:9,fontFamily:"'Orbitron',sans-serif",color:rc.color,fontWeight:700}}>{rc.label}</div>
                    {nxt&&<div style={{fontSize:7,color:"#334155"}}>{nxt.needed}pts → {nxt.next}</div>}
                    {card.team_name&&<div style={{fontSize:7,color:"#475569"}}>{card.team_name}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TEAMS ── */}
      {section==="teams"&&(
        <div>
          {filteredTeams.length===0&&(
            <div style={{textAlign:"center",padding:"30px 20px",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>
              No teams match these filters
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(auto-fill,minmax(130px,1fr))",gap:mob?8:10}}>
            {filteredTeams.map(team=>{
              const defId=`mlb_team_${team.id}`;
              const owned=ownedCardIds.has(defId);
              const ownedCard=myTeamCards.find(c=>c.card_def_id===defId);
              const rarity=owned?getCardRarityFromTotal(ownedCard?.total_play_rating||0):"general";
              const rc=RARITY_CFG[rarity];
              return(
                <div key={team.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                  opacity:owned?1:0.32,filter:owned?"none":"grayscale(1) brightness(0.4)",transition:"all .2s"}}>
                  {owned
                    ?<CardDisplay type="team" name={team.name} headshot={ownedCard?.custom_headshot||mlbTeamLogo(team.id)}
                        totalRating={ownedCard?.total_play_rating||0} customBorder={ownedCard?.custom_border||undefined}
                        customEffect={ownedCard?.custom_effect||undefined} size={mob?"sm":"md"}
                        pinned={ownedCard?.pinned} serial={ownedCard?.serial}/>
                    :<div style={{width:mob?108:138,height:mob?155:198,borderRadius:12,
                        border:"2px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)",
                        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                        <img src={mlbTeamLogo(team.id)} style={{width:"50%",height:"50%",objectFit:"contain",opacity:.3}}
                          onError={e=>e.target.style.display="none"}/>
                        <div style={{fontSize:8,color:"#1e3a5f",fontFamily:"'Orbitron',sans-serif",textAlign:"center",padding:"0 4px"}}>{team.name}</div>
                        <div style={{fontSize:7,color:"#0d2545"}}>800⭐ to unlock</div>
                      </div>
                  }
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:mob?8:9,fontFamily:"'Orbitron',sans-serif",color:owned?rc.color:"#1e3a5f",fontWeight:700}}>
                      {owned?rc.label:"Locked"}
                    </div>
                    <div style={{fontSize:7,color:"#334155"}}>{team.abbr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PLAYS ── */}
      {section==="plays"&&(
        <div>
          {!allPlays.length&&(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:36,marginBottom:10}}>⚡</div>
              <div style={{color:"#334155",fontSize:13,fontFamily:"'Orbitron',sans-serif"}}>No plays collected yet</div>
              <div style={{color:"#1e3a5f",fontSize:11,marginTop:4}}>Open packs to collect real 2025 MLB play cards</div>
            </div>
          )}
          {allPlays.length>0&&filteredPlays.length===0&&(
            <div style={{textAlign:"center",padding:"30px 20px",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>
              No plays match these filters
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:mob?8:12}}>
            {filteredPlays.map(({pd,owned},i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                opacity:owned?1:0.25,filter:owned?"none":"grayscale(1) brightness(0.3)",transition:"all .2s"}}>
                <PlayCard play={pd} size={mob?"sm":"md"}/>
                {pd.prestige&&<div style={{fontSize:8,color:"#FFD700",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✨ PRESTIGE</div>}
                <div style={{fontSize:7,color:owned?"#22C55E":"#334155",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>
                  {owned?"OWNED":""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CardsPage({cu}){
  const mob=useIsMobile();
  const{stars,refresh:refreshStars,earn,spend,claimDaily}=useStars(cu);
  const[tab,setTab]=useState("market");
  const[myCards,setMyCards]=useState([]);
  const[myPlays,setMyPlays]=useState([]);
  const[packResult,setPackResult]=useState(null);
  const[packLoading,setPackLoading]=useState(false);
  const[toast,setToast]=useState(null);
  const[dailyClaimed,setDailyClaimed]=useState(false);
  const[customizeTarget,setCustomizeTarget]=useState(null);

  const showToast=(msg,color="#22C55E")=>{setToast({msg,color});setTimeout(()=>setToast(null),3000);};

  const loadMyCards=useCallback(async()=>{
    if(!cu)return;
    const rows=await sb.get("nova_user_cards",`?user_id=eq.${cu.id}&order=acquired_at.desc`);
    if(!rows?.length){setMyCards([]);return;}
    // Auto-fix any old ESPN headshot URLs to MLB static
    const fixed=rows.map(card=>{
      if(card.card_type==="player"&&card.player_id&&(!card.headshot_url||card.headshot_url.includes("espncdn"))){
        return{...card,headshot_url:mlbPlayerHeadshot(card.player_id)};
      }
      if(card.card_type==="team"&&card.card_def_id&&(!card.headshot_url||card.headshot_url.includes("espncdn"))){
        const teamId=card.card_def_id.replace("mlb_team_","");
        return{...card,headshot_url:mlbTeamLogo(teamId)};
      }
      return card;
    });
    setMyCards(fixed);
  },[cu?.id]);
  const loadMyPlays=useCallback(async()=>{
    if(!cu)return;
    const rows=await sb.get("nova_user_plays",`?user_id=eq.${cu.id}&order=acquired_at.desc`);
    setMyPlays(rows||[]);
  },[cu?.id]);

  useEffect(()=>{
    loadMyCards();loadMyPlays();
    if(!cu)return;
    sb.get("nova_stars",`?user_id=eq.${cu.id}&limit=1`).then(rows=>{
      if(!rows?.length)return;
      const pstDay=(ts)=>{const d=new Date((ts||0)-8*3600000);return`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;};
      setDailyClaimed(pstDay(rows[0].last_login_claim||0)===pstDay(Date.now()));
    });
  },[cu?.id]);

  const buyCard=async(cardDef)=>{
    if(!cu){showToast("Sign in first!","#EF4444");return;}
    if(myCards.find(c=>c.card_def_id===cardDef.id)){showToast("Already owned!","#F59E0B");return;}
    const cost=cardDef.type==="team"?800:200;
    if(stars<cost){showToast(`Need ${cost}⭐ · You have ${stars}⭐`,"#EF4444");return;}
    const ok=await spend(cost,`Bought ${cardDef.name} card`);
    if(!ok){showToast("Not enough stars!","#EF4444");return;}
    // Serial number = total cards of this type + 1
    const existingCount=await sb.get("nova_user_cards",`?card_def_id=eq.${cardDef.id}`);
    const serial=`#${(existingCount?.length||0)+1}`;
    const newCard={id:gid(),user_id:cu.id,card_def_id:cardDef.id,card_type:cardDef.type,card_name:cardDef.name,player_id:cardDef.player_id||null,team_name:cardDef.team_name||null,headshot_url:cardDef.headshot_url||null,level:0,total_play_rating:0,custom_name:"",custom_border:"",custom_bg:"",custom_effect:"",pinned:false,pin_order:0,serial,acquired_at:Date.now()};
    await sb.upsert("nova_user_cards",newCard,"id");
    setMyCards(p=>[newCard,...p]);
    showToast(`🃏 Got ${cardDef.name} ${serial}!`);
    // Check team tier bonus
    if(cardDef.type==="team"){
      const allOwners=await sb.get("nova_user_cards",`?card_def_id=eq.${cardDef.id}`);
      const count=allOwners?.length||0;
      const tier=TEAM_TIERS.findIndex(t=>count===t);
      if(tier>=0){
        // Give 5 stars to all owners
        const ownerIds=[...new Set((allOwners||[]).map(c=>c.user_id))];
        for(const uid of ownerIds){
          const rows=await sb.get("nova_stars",`?user_id=eq.${uid}&limit=1`);
          if(rows?.length)await sb.patch("nova_stars",`?user_id=eq.${uid}`,{balance:(rows[0].balance||0)+5,lifetime_earned:(rows[0].lifetime_earned||0)+5});
        }
        showToast(`🎉 Tier ${tier+1} reached! All ${cardDef.name} owners got +5⭐!`,"#F59E0B");
      }
    }
    refreshStars();
  };

  const openPack=async(packType,playerIdForPack,myTeamCard)=>{
    if(!cu)return;
    const pack=PACK_DEFS[packType];
    if(stars<pack.cost){showToast(`Need ${pack.cost}⭐`,"#EF4444");return;}
    if(pack.maxDaily<999){
      const today=new Date().toLocaleDateString("en-US",{timeZone:"America/Los_Angeles"}).replace(/\//g,"-");
      const todayLog=await sb.get("nova_pack_log",`?user_id=eq.${cu.id}&pack_type=eq.${packType}&pack_date=eq.${today}`);
      if((todayLog?.length||0)>=pack.maxDaily){showToast(`Daily limit: ${pack.maxDaily}× ${pack.name}`,"#F59E0B");return;}
      await sb.upsert("nova_pack_log",{id:gid(),user_id:cu.id,pack_type:packType,pack_date:today,ts:Date.now()},"id");
    }
    setPackLoading(true);
    let fetchedPlays=[];
    let fetchError=null;
    try{
      const teamNameParam=packType==="team"&&myTeamCard?`&team_name=${encodeURIComponent(myTeamCard.team_name||myTeamCard.card_name)}`:"";
      const playerParam=playerIdForPack?`&player_id=${playerIdForPack}`:"";
      const url=`/api/hyperbeam?mlb_plays=1&pack_type=${packType}&count=${pack.playCount}${teamNameParam}${playerParam}`;
      const r=await fetch(url,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),20000);return c.signal;})()});
      const d=await r.json();
      fetchedPlays=d.plays||[];
      if(d.error&&!fetchedPlays.length)fetchError=d.error;
    }catch(e){fetchError=e.message;}
    // Never use fake data — if no real plays, refund and tell the user
    if(!fetchedPlays.length){
      setPackLoading(false);
      showToast("Couldn't fetch real MLB plays right now — not charged. Try again!","#F59E0B");
      return;
    }
    const ok=await spend(pack.cost,`Opened ${pack.name}`);
    if(!ok){setPackLoading(false);showToast("Not enough stars!","#EF4444");return;}
    // Save plays with serials
    for(const p of fetchedPlays){
      const existingCount=await sb.get("nova_user_plays",`?user_id=eq.${cu.id}`);
      const serial=`#${(existingCount?.length||0)+1}`;
      await sb.upsert("nova_user_plays",{id:gid(),user_id:cu.id,play_data:JSON.stringify({...p,serial}),applied_to:null,pinned:false,acquired_at:Date.now()},"id");
    }
    setPackLoading(false);
    setPackResult({pack,plays:fetchedPlays});
    loadMyPlays();
    refreshStars();
  };

  // Recalculate a card's total rating from all currently applied plays
  const recalcCardRating=async(cardId)=>{
    const appliedPlays=await sb.get("nova_user_plays",`?user_id=eq.${cu.id}&applied_to=eq.${cardId}`);
    let total=0;
    for(const p of (appliedPlays||[])){
      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
      total+=(pd?.rating||0);
    }
    await sb.patch("nova_user_cards",`?id=eq.${cardId}`,{total_play_rating:total});
    return total;
  };

  const applyPlay=async(userPlay,userCard)=>{
    const pd=typeof userPlay.play_data==="string"?JSON.parse(userPlay.play_data):userPlay.play_data;
    const rating=pd?.rating||0;
    // Mark play as applied first
    await sb.patch("nova_user_plays",`?id=eq.${userPlay.id}`,{applied_to:userCard.id});
    setMyPlays(p=>p.map(pl=>pl.id===userPlay.id?{...pl,applied_to:userCard.id}:pl));
    // Recalculate from source of truth
    const newTotal=await recalcCardRating(userCard.id);
    const newRarity=getCardRarityFromTotal(newTotal);
    const oldRarity=getCardRarityFromTotal(userCard.total_play_rating||0);
    setMyCards(p=>p.map(c=>c.id===userCard.id?{...c,total_play_rating:newTotal}:c));
    if(newRarity!==oldRarity){
      const rc=RARITY_CFG[newRarity];
      showToast(`🎉 ${userCard.card_name} reached ${rc.label.toUpperCase()}!`,rc.color);
    }else{
      showToast(`⚡ +${rating}pts → ${userCard.card_name} (${newTotal} total)`);
    }
  };

  const prestigePlay=async(trio)=>{
    if(trio.length!==3)return;
    const pd=typeof trio[0].play_data==="string"?JSON.parse(trio[0].play_data):trio[0].play_data;
    if(!pd)return;
    const prestigedPlay={...pd,rating:pd.rating*3,prestige:true,serial:`#P${Math.floor(Math.random()*9999)+1}`,rarity:getPlayRarity(pd.rating*3)};
    // Delete the 3 source plays
    for(const p of trio){
      await sb.del("nova_user_plays",`?id=eq.${p.id}`);
    }
    const newPid=gid();
    await sb.upsert("nova_user_plays",{id:newPid,user_id:cu.id,play_data:JSON.stringify(prestigedPlay),applied_to:null,pinned:false,acquired_at:Date.now()},"id");
    setMyPlays(p=>[...p.filter(pl=>!trio.map(t=>t.id).includes(pl.id)),{id:newPid,play_data:JSON.stringify(prestigedPlay),applied_to:null,acquired_at:Date.now()}]);
    // Recalc any cards these were applied to
    const appliedCards=[...new Set(trio.map(t=>t.applied_to).filter(Boolean))];
    for(const cid of appliedCards){await recalcCardRating(cid);}
    await loadMyCards();
    showToast(`✨ PRESTIGE! New rating: ${prestigedPlay.rating}⭐ — ${prestigedPlay.rarity.toUpperCase()}!`,"#FFD700");
  };

  const togglePin=async(card)=>{
    const pinned=myCards.filter(c=>c.pinned);
    if(!card.pinned&&pinned.length>=10){showToast("Max 10 cards pinned to profile!","#F59E0B");return;}
    await sb.patch("nova_user_cards",`?id=eq.${card.id}`,{pinned:!card.pinned});
    setMyCards(p=>p.map(c=>c.id===card.id?{...c,pinned:!c.pinned}:c));
    showToast(card.pinned?"Unpinned from profile":"📌 Pinned to profile!");
  };

  const togglePinPlay=async(play)=>{
    const pinnedPlays=myPlays.filter(p=>p.pinned);
    if(!play.pinned&&pinnedPlays.length>=10){showToast("Max 10 plays pinned to profile!","#F59E0B");return;}
    await sb.patch("nova_user_plays",`?id=eq.${play.id}`,{pinned:!play.pinned});
    setMyPlays(p=>p.map(pl=>pl.id===play.id?{...pl,pinned:!pl.pinned}:pl));
    showToast(play.pinned?"Play unpinned":"📌 Play pinned to profile!");
  };

  const myTeamCard=myCards.find(c=>c.card_type==="team");
  const TABS=[["market","🏪 Market"],["mycards","🃏 My Cards"],["packs","🎁 Packs"],["plays","⚡ My Plays"],["collection","📖 Collection"]];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"14px 12px 100px":"28px 20px 80px",position:"relative"}}>
      {toast&&<div style={{position:"fixed",top:74,left:"50%",transform:"translateX(-50%)",background:"rgba(8,13,26,.97)",border:`1px solid ${toast.color}44`,borderRadius:12,padding:"10px 22px",zIndex:500,color:toast.color,fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,.7)",pointerEvents:"none",whiteSpace:"nowrap",animation:"starPop .3s ease"}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?15:22,fontWeight:900,background:"linear-gradient(135deg,#F59E0B,#A855F7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:2}}>⚾ NOVA CARDS</div>
          <div style={{fontSize:11,color:"#334155"}}>Collect · Level Up · Flex · MLB 2025</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <StarBadge stars={stars}/>
          {cu&&!dailyClaimed&&<button onClick={async()=>{const r=await claimDaily();if(r==="already_claimed"){showToast("Already claimed today! 🌙","#F59E0B");return;}if(r){setDailyClaimed(true);showToast(`⭐ +${r.stars} stars! Streak: ${r.streak} days`);refreshStars();}}} style={{padding:"6px 13px",borderRadius:8,background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.4)",color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>🎁 Daily Bonus</button>}
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"8px 15px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?"rgba(245,158,11,.5)":"rgba(255,255,255,.08)"}`,background:tab===k?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",color:tab===k?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>)}
      </div>
      {tab==="market"&&<CardMarketTab cu={cu} stars={stars} myCards={myCards} onBuy={buyCard}/>}
      {tab==="mycards"&&<MyCardsTab cu={cu} cards={myCards} plays={myPlays} onCustomize={setCustomizeTarget} onPin={togglePin} onApply={applyPlay}/>}
      {tab==="packs"&&<PackShopTab cu={cu} stars={stars} loading={packLoading} onOpen={openPack} myTeamCard={myTeamCard}/>}
      {tab==="plays"&&<MyPlaysTab cu={cu} plays={myPlays} cards={myCards} onApply={applyPlay} onPrestige={prestigePlay} onPinPlay={togglePinPlay}/>}
      {tab==="collection"&&<CollectionTab cu={cu} myCards={myCards} myPlays={myPlays}/>}
      {packResult&&<PackOpenModal pack={packResult.pack} plays={packResult.plays} onClose={()=>setPackResult(null)} onKeep={()=>{setPackResult(null);setTab("plays");loadMyPlays();}}/>}
      {customizeTarget&&<CardCustomizeModal card={customizeTarget} onClose={()=>setCustomizeTarget(null)} onSave={async(updates)=>{await sb.patch("nova_user_cards",`?id=eq.${customizeTarget.id}`,updates);setMyCards(p=>p.map(c=>c.id===customizeTarget.id?{...c,...updates}:c));setCustomizeTarget(null);showToast("Card updated! ✏️");}}/>}
    </div>
  );
}


function Navbar({cu,onLogin,onRegister,onLogout,nav,page,notifs,onReadNotifs,onClearNotifs,onMarkOneNotif,users,msgUnread}){
  const mob=useIsMobile();
  const[gamesOpen,setGamesOpen]=useState(false);
  const[leaguesOpen,setLeaguesOpen]=useState(false);
  const gamesRef=useRef(null);
  const leaguesRef=useRef(null);
<<<<<<< HEAD
 const GAMES_PAGES = ["trivia","leaderboard","cards","gmmode","animecards","rtts"];
=======
  const GAMES_PAGES=["trivia","leaderboard","cards","gmmode","animecards"];
>>>>>>> 3a37ea0 (Add RTTS mode)
  const HUB_PAGES=["hub","stats","news","predict"];
  const LEAGUE_PAGES=["nffl","nbbl","ringrush"];
  const dTabs=[["home","Home"],["members","Members"],["feed","🎬 Feed"]];
  const mTabs=[{p:"home",icon:"🏠",lbl:"Home"},{p:"hub",icon:"📊",lbl:"Hub"},{p:"feed",icon:"🎬",lbl:"Feed"},{p:"members",icon:"👥",lbl:"Members"},{p:"messages",icon:"💬",lbl:"DMs",badge:msgUnread}];
  // Close dropdowns on outside click
  useEffect(()=>{
    const h=(e)=>{
      if(gamesRef.current&&!gamesRef.current.contains(e.target))setGamesOpen(false);
      if(leaguesRef.current&&!leaguesRef.current.contains(e.target))setLeaguesOpen(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mob?"0 12px":"0 20px",background:"rgba(3,7,18,.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.055)"}}>
        <div style={{display:"flex",alignItems:"center",gap:mob?8:16}}>
          <button onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:20}}>💫</span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:mob?15:17,letterSpacing:".12em",background:"linear-gradient(135deg,#fff 10%,#00D4FF 55%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</span>
          </button>
          {!mob&&(
            <div style={{display:"flex",gap:1,alignItems:"center"}}>
              {dTabs.map(([p,l])=><button key={p} onClick={()=>nav(p)} style={{background:page===p?"rgba(0,212,255,.09)":"none",border:page===p?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page===p?"#00D4FF":"#94A3B8",transition:"all .2s",whiteSpace:"nowrap"}}>{l}</button>)}
              {/* Hub tab — News + Stats + Predict */}
              <button onClick={()=>nav("hub")} style={{background:HUB_PAGES.includes(page)?"rgba(0,212,255,.09)":"none",border:HUB_PAGES.includes(page)?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:HUB_PAGES.includes(page)?"#00D4FF":"#94A3B8",transition:"all .2s",whiteSpace:"nowrap"}}>📊 Hub</button>
              {/* Leagues dropdown */}
              <div ref={leaguesRef} style={{position:"relative"}}>
                <button onClick={()=>setLeaguesOpen(o=>!o)} style={{background:LEAGUE_PAGES.includes(page)?"rgba(239,68,68,.09)":"none",border:LEAGUE_PAGES.includes(page)?"1px solid rgba(239,68,68,.25)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:LEAGUE_PAGES.includes(page)?"#EF4444":"#94A3B8",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
                  🏆 Leagues <span style={{fontSize:9,opacity:.7,transition:"transform .2s",transform:leaguesOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>▼</span>
                </button>
                {leaguesOpen&&(
                  <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,background:"linear-gradient(160deg,#0c1220,#10172a)",border:"1px solid rgba(239,68,68,.25)",borderRadius:12,padding:6,minWidth:170,zIndex:200,boxShadow:"0 16px 40px rgba(0,0,0,.7)"}}>
                    {[["nffl","🏈","#F59E0B","Football League","Football League"],["nbbl","⚾","#22C55E","Baseball League","Baseball League"],["ringrush","🏀","#EC4899","Basketball League","Basketball League"]].map(([p,icon,col,label,sub])=>(
                      <button key={p} onClick={()=>{nav(p);setLeaguesOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,background:page===p?col+"18":"none",border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?col:"#E2E8F0"}}>{label}</div>
                          <div style={{fontSize:10,color:"#475569"}}>{sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Games dropdown */}
              <div ref={gamesRef} style={{position:"relative"}}>
                <button onClick={()=>setGamesOpen(o=>!o)} style={{background:GAMES_PAGES.includes(page)?"rgba(168,85,247,.09)":"none",border:GAMES_PAGES.includes(page)?"1px solid rgba(168,85,247,.25)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:GAMES_PAGES.includes(page)?"#A855F7":"#94A3B8",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
                  🎮 Games <span style={{fontSize:9,opacity:.7,transition:"transform .2s",transform:gamesOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>▼</span>
                </button>
                {gamesOpen&&(
                  <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,background:"linear-gradient(160deg,#0c1220,#10172a)",border:"1px solid rgba(168,85,247,.25)",borderRadius:12,padding:6,minWidth:160,zIndex:200,boxShadow:"0 16px 40px rgba(0,0,0,.7)"}}>
<<<<<<< HEAD
                   {[
  ["gmmode","🏆","GM Mode","Be the GM of any pro sports team"],
  ["rtts","⚾","Road to the Show","Create your MLB superstar and rise through the minors"],
  ["cards","⚾","Nova Cards","Collect & level up MLB player cards"],
  ["animecards","🌸","Anime Cards","Collect, build decks & battle"],
  ["trivia","🧠","Trivia","Test your sports knowledge"],
  ["leaderboard","🏆","Leaderboard","Top members ranked"]
].map(([p,icon,label,desc]) => (
=======
                    {[["gmmode","🏆","GM Mode","Be the GM of any pro sports team — trades, draft, simulate a season"],["cards","⚾","Nova Cards","Collect & level up MLB player cards"],["animecards","🌸","Anime Cards","Collect, build decks & battle with anime characters"],["trivia","🧠","Trivia","Test your sports knowledge"],["leaderboard","🏆","Leaderboard","Top members ranked"]].map(([p,icon,label,desc])=>(
>>>>>>> 3a37ea0 (Add RTTS mode)
                      <button key={p} onClick={()=>{nav(p);setGamesOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,background:page===p?"rgba(168,85,247,.12)":"none",border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?"#A855F7":"#E2E8F0"}}>{label}</div>
                          <div style={{fontSize:10,color:"#475569"}}>{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin")&&<button onClick={()=>nav("dashboard")} style={{background:page==="dashboard"?"rgba(245,158,11,.09)":"none",border:page==="dashboard"?"1px solid rgba(245,158,11,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page==="dashboard"?"#F59E0B":"#94A3B8"}}>⚡ Dashboard</button>}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:mob?6:8}}>
          {cu ? (
            <>
              <NotifBell notifs={notifs} onRead={onReadNotifs} onClear={onClearNotifs} onMarkOne={onMarkOneNotif} navigate={nav} users={users}/>
              {!mob&&(
                <button onClick={()=>nav("messages")} style={{position:"relative",background:page==="messages"?"rgba(0,212,255,.1)":"none",border:`1px solid ${page==="messages"?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>
                  💬
                  {msgUnread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#00D4FF,#8B5CF6)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{msgUnread>9?"9+":msgUnread}</div>}
                </button>
              )}
              <button onClick={()=>nav("profile",cu.id)} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:9,padding:mob?"4px 8px":"4px 10px",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:600}}>
                <div style={{position:"relative",width:26,height:26,borderRadius:"50%",overflow:"hidden",background:`radial-gradient(circle,${cu.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                  {cu.avatar_url?<img src={cu.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:cu.avatar}
                  <StatusDot type={cu.status_type||"offline"} size={8} style={{position:"absolute",bottom:-1,right:-1}}/>
                </div>
                {!mob&&<span style={{maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cu.display_name}</span>}
              </button>
              {!mob&&<Btn variant="muted" size="sm" onClick={onLogout}>Out</Btn>}
              {mob&&(cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin")&&<button onClick={()=>nav("dashboard")} style={{background:"none",border:"1px solid rgba(245,158,11,.3)",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>⚡</button>}
            </>
          ) : (
            <>
              <Btn variant="ghost" size="sm" onClick={onLogin}>Sign In</Btn>
              <Btn variant="primary" size="sm" onClick={onRegister}>{mob?"Join":"Join Nova"}</Btn>
            </>
          )}
        </div>
      </nav>
      {mob&&(
        <div className="mob-nav">
          {mTabs.map(t=>(
            <button key={t.p} className="mob-tab" onClick={()=>nav(t.p)} style={{color:page===t.p?"#00D4FF":"#475569"}}>
              <span className="mob-tab-icon" style={{position:"relative"}}>
                {t.icon}
                {t.badge>0&&<span style={{position:"absolute",top:-4,right:-6,width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"white",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"1.5px solid #030712"}}>{t.badge>9?"9+":t.badge}</span>}
              </span>
              <span className="mob-tab-label" style={{color:page===t.p?"#00D4FF":"#475569"}}>{t.lbl}</span>
            </button>
          ))}
          {/* Games button on mobile */}
          <button className="mob-tab" onClick={()=>setGamesOpen(o=>!o)} style={{color:GAMES_PAGES.includes(page)?"#A855F7":"#475569"}}>
            <span className="mob-tab-icon">🎮</span>
            <span className="mob-tab-label" style={{color:GAMES_PAGES.includes(page)?"#A855F7":"#475569"}}>Games</span>
          </button>
          {/* Leagues button on mobile */}
          <button className="mob-tab" onClick={()=>setLeaguesOpen(o=>!o)} style={{color:LEAGUE_PAGES.includes(page)?"#EF4444":"#475569"}}>
            <span className="mob-tab-icon">🏆</span>
            <span className="mob-tab-label" style={{color:LEAGUE_PAGES.includes(page)?"#EF4444":"#475569"}}>Leagues</span>
          </button>
        </div>
      )}
      {/* Mobile games sheet */}
      {mob&&gamesOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.7)"}} onClick={()=>setGamesOpen(false)}>
          <div style={{position:"absolute",bottom:70,left:0,right:0,background:"linear-gradient(160deg,#0c1220,#10172a)",borderTop:"1px solid rgba(168,85,247,.25)",borderRadius:"20px 20px 0 0",padding:"20px 16px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:14}}>🎮 GAMES</div>
            {[["gmmode","🏆","GM Mode","Be the GM of any pro sports team — trades, draft, simulate a season"],["cards","⚾","Nova Cards","Collect & level up MLB player cards"],["animecards","🌸","Anime Cards","Collect, build decks & battle with anime characters"],["trivia","🧠","Trivia","Test your sports knowledge"],["leaderboard","🏆","Leaderboard","Top members ranked"]].map(([p,icon,label,desc])=>(
              <button key={p} onClick={()=>{nav(p);setGamesOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 14px",borderRadius:12,background:page===p?"rgba(168,85,247,.12)":"rgba(255,255,255,.03)",border:"1px solid "+(page===p?"rgba(168,85,247,.3)":"rgba(255,255,255,.06)"),marginBottom:8,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22}}>{icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?"#A855F7":"#E2E8F0"}}>{label}</div>
                  <div style={{fontSize:11,color:"#475569"}}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Mobile leagues sheet */}
      {mob&&leaguesOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.7)"}} onClick={()=>setLeaguesOpen(false)}>
          <div style={{position:"absolute",bottom:70,left:0,right:0,background:"linear-gradient(160deg,#0c1220,#10172a)",borderTop:"1px solid rgba(239,68,68,.25)",borderRadius:"20px 20px 0 0",padding:"20px 16px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:14}}>🏆 LEAGUES</div>
            {[["nffl","🏈","#F59E0B","Football League","Football League"],["nbbl","⚾","#22C55E","Baseball League","Baseball League"],["ringrush","🏀","#EC4899","Basketball League","Basketball League"]].map(([p,icon,col,label,sub])=>(
              <button key={p} onClick={()=>{nav(p);setLeaguesOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 14px",borderRadius:12,background:page===p?col+"18":"rgba(255,255,255,.03)",border:"1px solid "+(page===p?col+"44":"rgba(255,255,255,.06)"),marginBottom:8,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22}}>{icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?col:"#E2E8F0"}}>{label}</div>
                  <div style={{fontSize:11,color:"#475569"}}>{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────

// ─── WebRTC helpers ─────────────────────────────────────────────────────────────
const ICE_SERVERS={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]};

// Supabase-based signaling: store offer/answer/candidates in nova_signaling
const sig={
  send:async(convId,fromId,type,data)=>{
    await sb.post("nova_signaling",{id:gid(),conv_id:convId,from_id:fromId,type,data:JSON.stringify(data),ts:Date.now()});
  },
  poll:async(convId,afterTs,excludeId)=>{
    return await sb.get("nova_signaling",`?conv_id=eq.${convId}&ts=gt.${afterTs}&from_id=neq.${excludeId}&order=ts.asc`)||[];
  },
  clear:async(convId)=>{
    await sb.del("nova_signaling",`?conv_id=eq.${convId}`);
  },
};

// ─── Voice Call Component ────────────────────────────────────────────────────────
function VoiceCall({cu,conv,users,onEnd}){
  const [status,setStatus]=useState("connecting"); // connecting | active | ended
  const [muted,setMuted]=useState(false);
  const [speaking,setSpeaking]=useState({}); // userId -> bool
  const [remoteNames,setRemoteNames]=useState([]);
  const pcRefs=useRef({});   // peerId -> RTCPeerConnection
  const streamRef=useRef(null);
  const pollRef=useRef(null);
  const tsRef=useRef(Date.now()-500);
  const isHost=useRef(false);

  useEffect(()=>{start();return()=>cleanup();},[]);

  const cleanup=()=>{
    clearInterval(pollRef.current);
    Object.values(pcRefs.current).forEach(pc=>{try{pc.close();}catch{}});
    pcRefs.current={};
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
  };

  const start=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
      streamRef.current=stream;
      // Check if there's already a call active in this conv
      const existing=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}&type=eq.call-offer&order=ts.desc&limit=1`);
      if(existing&&existing.length>0){
        // Join existing call as answerer
        await joinCall(existing[0]);
      } else {
        // Start new call as host
        isHost.current=true;
        await sig.send(conv.id,cu.id,"call-offer",{callerId:cu.id,callerName:cu.display_name,ts:Date.now()});
      }
      setStatus("active");
      // Poll for signaling messages
      pollRef.current=setInterval(()=>pollSignals(),1200);
    }catch(e){
      console.error("Voice error:",e);
      setStatus("ended");
    }
  };

  const createPC=async(peerId)=>{
    const pc=new RTCPeerConnection(ICE_SERVERS);
    pcRefs.current[peerId]=pc;
    // Add local tracks
    streamRef.current?.getTracks().forEach(t=>pc.addTrack(t,streamRef.current));
    // Play remote audio
    pc.ontrack=e=>{
      const audio=new Audio();
      audio.srcObject=e.streams[0];
      audio.autoplay=true;
      // Speaking detection
      const ctx=new AudioContext();
      const src=ctx.createMediaStreamSource(e.streams[0]);
      const analyser=ctx.createAnalyser();
      analyser.fftSize=512;
      src.connect(analyser);
      const check=()=>{
        const d=new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        const vol=d.reduce((a,b)=>a+b,0)/d.length;
        setSpeaking(prev=>({...prev,[peerId]:vol>15}));
        if(pcRefs.current[peerId])requestAnimationFrame(check);
      };
      check();
    };
    pc.onicecandidate=e=>{
      if(e.candidate)sig.send(conv.id,cu.id,"ice-candidate",{to:peerId,candidate:e.candidate});
    };
    return pc;
  };

  const joinCall=async(offerMsg)=>{
    const {callerId}=JSON.parse(offerMsg.data||"{}");
    if(callerId===cu.id)return;
    const pc=await createPC(callerId);
    // Send our join signal
    await sig.send(conv.id,cu.id,"call-join",{joinerId:cu.id,joinerName:cu.display_name});
    setRemoteNames(prev=>[...new Set([...prev,users.find(u=>u.id===callerId)?.display_name||"Someone"])]);
  };

  const pollSignals=async()=>{
    const msgs=await sig.poll(conv.id,tsRef.current,cu.id);
    if(!msgs.length)return;
    tsRef.current=Math.max(...msgs.map(m=>m.ts));
    for(const m of msgs){
      const data=JSON.parse(m.data||"{}");
      if(m.type==="call-join"&&isHost.current){
        // Host creates offer for new joiner
        const {joinerId,joinerName}=data;
        if(joinerId===cu.id)continue;
        setRemoteNames(prev=>[...new Set([...prev,joinerName||"Someone"])]);
        const pc=await createPC(joinerId);
        const offer=await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sig.send(conv.id,cu.id,"sdp-offer",{to:joinerId,sdp:offer});
      } else if(m.type==="sdp-offer"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id]||await createPC(m.from_id);
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer=await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sig.send(conv.id,cu.id,"sdp-answer",{to:m.from_id,sdp:answer});
        setRemoteNames(prev=>[...new Set([...prev,users.find(u=>u.id===m.from_id)?.display_name||"Someone"])]);
      } else if(m.type==="sdp-answer"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id];
        if(pc&&pc.signalingState!=="stable")await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if(m.type==="ice-candidate"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id];
        if(pc)try{await pc.addIceCandidate(new RTCIceCandidate(data.candidate));}catch{}
      } else if(m.type==="call-end"){
        endCall();
      }
    }
  };

  const endCall=async()=>{
    await sig.send(conv.id,cu.id,"call-end",{});
    await sig.clear(conv.id);
    cleanup();
    setStatus("ended");
    setTimeout(onEnd,800);
  };

  const toggleMute=()=>{
    const enabled=!muted;
    streamRef.current?.getAudioTracks().forEach(t=>t.enabled=enabled);
    setMuted(!muted);
  };

  if(status==="ended")return null;

  return(
    <div style={{position:"fixed",bottom:80,right:20,zIndex:500,background:"linear-gradient(135deg,#0c1220,#0f1929)",border:"1px solid rgba(34,197,94,.3)",borderRadius:16,padding:"14px 18px",minWidth:220,boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#22C55E",letterSpacing:".12em",marginBottom:10}}>
        {status==="connecting"?"⏳ CONNECTING...":"🔴 VOICE CALL · LIVE"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:speaking[cu.id]?"#22C55E":"#334155",flexShrink:0}}/>
          <span style={{fontSize:12,color:"#E2E8F0",fontWeight:700}}>{cu.display_name} {muted?"🔇":""}</span>
        </div>
        {remoteNames.map((n,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:speaking[i]?"#22C55E":"#334155",flexShrink:0}}/>
            <span style={{fontSize:12,color:"#94A3B8"}}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={toggleMute} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${muted?"rgba(245,158,11,.4)":"rgba(255,255,255,.1)"}`,background:muted?"rgba(245,158,11,.15)":"rgba(255,255,255,.05)",cursor:"pointer",fontSize:13,color:muted?"#F59E0B":"#94A3B8"}}>
          {muted?"🔇 Unmute":"🎤 Mute"}
        </button>
        <button onClick={endCall} style={{flex:1,padding:"7px 0",borderRadius:10,border:"1px solid rgba(239,68,68,.4)",background:"rgba(239,68,68,.15)",cursor:"pointer",fontSize:13,color:"#EF4444"}}>
          📵 End
        </button>
      </div>
    </div>
  );
}

// ─── Watch Party Component ───────────────────────────────────────────────────────
// ─── Watch Party (Hyperbeam) ─────────────────────────────────────────────────────
// ─── GIF Picker (Tenor) with starred favorites ───────────────────────────────────
// Tenor anonymous key - works from any domain, no registration needed
const TENOR_KEY = "LIVDSRZULELA";

// Favorites stored in localStorage per user
const getFavGifs=()=>{try{return JSON.parse(localStorage.getItem("nova_fav_gifs")||"[]");}catch{return[];}};
const saveFavGifs=arr=>{try{localStorage.setItem("nova_fav_gifs",JSON.stringify(arr.slice(0,50)));}catch{}};

function GifPicker({onSelect,onClose}){
  const [tab,setTab]=useState("trending"); // trending | search | favorites
  const [query,setQuery]=useState("");
  const [gifs,setGifs]=useState([]);
  const [favs,setFavs]=useState(()=>getFavGifs());
  const [loading,setLoading]=useState(false);
  const searchRef=useRef(null);

  useEffect(()=>{
    if(tab==="trending")fetchTrending();
    else if(tab==="search"&&query.trim())doSearch(query);
    else if(tab==="search")fetchTrending();
  },[tab]);

  useEffect(()=>{ if(tab!=="favorites")searchRef.current?.focus(); },[tab]);

  // Parse Tenor v1 result into {id, url, preview, title}
  const parseTenor=results=>(results||[]).map(g=>{
    const med=g.media?.[0];
    const url=med?.gif?.url||med?.mediumgif?.url||med?.tinygif?.url||"";
    const preview=med?.tinygif?.url||med?.gif?.url||url;
    return{id:g.id,url,preview,title:g.title||""};
  }).filter(g=>g.url);

  const fetchTrending=async()=>{
    setLoading(true);
    try{
      const r=await fetch(`https://api.tenor.com/v1/trending?key=${TENOR_KEY}&limit=24&contentfilter=medium&media_filter=minimal`);
      const d=await r.json();
      setGifs(parseTenor(d.results));
    }catch(e){console.error("Tenor trending error",e);}
    setLoading(false);
  };

  const doSearch=async(q)=>{
    if(!q.trim()){fetchTrending();return;}
    setLoading(true);
    try{
      const r=await fetch(`https://api.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=24&contentfilter=medium&media_filter=minimal`);
      const d=await r.json();
      setGifs(parseTenor(d.results));
    }catch(e){console.error("Tenor search error",e);}
    setLoading(false);
  };

  const toggleFav=(gif,e)=>{
    e.stopPropagation();
    const exists=favs.find(f=>f.id===gif.id);
    const next=exists?favs.filter(f=>f.id!==gif.id):[gif,...favs];
    setFavs(next);
    saveFavGifs(next);
  };

  const isFav=id=>favs.some(f=>f.id===id);

  const displayGifs=tab==="favorites"?favs:gifs;

  const tabStyle=(t)=>({
    padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
    background:tab===t?"rgba(0,212,255,.2)":"rgba(255,255,255,.05)",
    color:tab===t?"#00D4FF":"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".05em"
  });

  return(
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.75)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:440,height:540,background:"#0c1220",border:"1px solid rgba(255,255,255,.12)",borderRadius:16,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.9)"}}>
        {/* Header */}
        <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:18}}>🎭</span>
          <input ref={searchRef} placeholder="Search GIFs..." value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){setTab("search");doSearch(query);}}}
            style={{flex:1,padding:"7px 12px",borderRadius:20,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"#E2E8F0",fontSize:13,outline:"none"}}/>
          <button onClick={()=>{setTab("search");doSearch(query);}} style={{background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#00D4FF",fontSize:12}}>Go</button>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:20,lineHeight:1}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:6,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0}}>
          <button style={tabStyle("trending")} onClick={()=>setTab("trending")}>🔥 Trending</button>
          <button style={tabStyle("search")} onClick={()=>setTab("search")}>🔍 Search</button>
          <button style={tabStyle("favorites")} onClick={()=>setTab("favorites")}>⭐ Saved {favs.length>0&&`(${favs.length})`}</button>
        </div>
        {/* Grid */}
        <div style={{flex:1,overflowY:"auto",padding:10,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,alignContent:"start"}}>
          {loading&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:30,color:"#475569",fontSize:13}}>Loading GIFs...</div>}
          {!loading&&tab==="favorites"&&favs.length===0&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"30px 20px",color:"#334155"}}>
              <div style={{fontSize:28,marginBottom:8}}>⭐</div>
              <div style={{fontSize:12}}>Star GIFs to save them here</div>
            </div>
          )}
          {!loading&&tab!=="favorites"&&gifs.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:30,color:"#475569"}}>No GIFs found</div>}
          {!loading&&displayGifs.map(g=>(
            <div key={g.id} style={{position:"relative",cursor:"pointer",borderRadius:8,overflow:"hidden",aspectRatio:"1",background:"rgba(255,255,255,.04)",border:`1px solid ${isFav(g.id)?"rgba(245,158,11,.4)":"rgba(255,255,255,.06)"}`,transition:"border-color .15s"}}
              onClick={()=>{onSelect(g.url);onClose();}}>
              <img src={g.preview||g.url} alt={g.title} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
              {/* Star button */}
              <button onClick={e=>toggleFav(g,e)} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.6)",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.opacity=1;e.currentTarget.parentElement.querySelector("button").style.opacity=1;}}
                className="gif-star">
                {isFav(g.id)?"⭐":"☆"}
              </button>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{padding:"6px 12px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".05em"}}>POWERED BY TENOR</div>
          {favs.length>0&&tab==="favorites"&&<button onClick={()=>{setFavs([]);saveFavGifs([]);}} style={{fontSize:10,color:"#EF4444",background:"none",border:"none",cursor:"pointer"}}>Clear all</button>}
        </div>
      </div>
    </div>
  );
}

const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";

async function createHBSession(){
  // Call our Vercel serverless proxy to avoid CORS
  const r = await fetch("/api/hyperbeam", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action:"create"})
  });
  if(!r.ok){ const t=await r.text(); throw new Error(t); }
  return r.json();
}

function WatchParty({cu,conv,users,onEnd}){
  const [phase,setPhase]=useState("idle"); // idle | loading | active
  const [embedUrl,setEmbedUrl]=useState(null);
  const [sessionId,setSessionId]=useState(null);
  const [chatMsgs,setChatMsgs]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [members,setMembers]=useState([cu.display_name]);
  const [wpGifPicker,setWpGifPicker]=useState(false);
  const [err,setErr]=useState(null);
  const chatPollRef=useRef(null);
  const chatTsRef=useRef(Date.now()-500);
  const memberPollRef=useRef(null);
  const isHost=useRef(false);
  const hbContainerRef=useRef(null);
  const hbInstanceRef=useRef(null);

  // Load Hyperbeam SDK once
  useEffect(()=>{
    if(!document.getElementById("hb-sdk")){
      const s=document.createElement("script");
      s.id="hb-sdk";
      s.src="https://unpkg.com/@hyperbeam/web@0.1.29/dist/index.js";
      s.crossOrigin="anonymous";
      document.head.appendChild(s);
    }
  },[]);

  // When embedUrl arrives and phase goes active, init SDK
  useEffect(()=>{
    if(phase!=="active"||!embedUrl||!hbContainerRef.current)return;
    const init=async()=>{
      // Wait for SDK to load
      let tries=0;
      while(!window.Hyperbeam&&!window.HyperbeamEmbed&&tries<30){await new Promise(r=>setTimeout(r,200));tries++;}
      const HB=window.Hyperbeam||window.HyperbeamEmbed;
      if(!HB){
        // SDK failed — fallback to iframe
        hbContainerRef.current.innerHTML=`<iframe src="${embedUrl}" allow="microphone;camera;fullscreen;clipboard-read;clipboard-write;autoplay" style="width:100%;height:100%;border:none;background:#000;"></iframe>`;
        return;
      }
      try{
        if(hbInstanceRef.current)hbInstanceRef.current.destroy();
        const fn=typeof HB==="function"?HB:(HB.default||HB.Hyperbeam);
        hbInstanceRef.current=await fn(hbContainerRef.current,embedUrl);
      }catch(e){
        console.error("HB SDK init error",e);
        // Fallback to iframe on SDK error
        hbContainerRef.current.innerHTML=`<iframe src="${embedUrl}" allow="microphone;camera;fullscreen;clipboard-read;clipboard-write;autoplay" style="width:100%;height:100%;border:none;background:#000;"></iframe>`;
      }
    };
    init();
    return()=>{ if(hbInstanceRef.current){try{hbInstanceRef.current.destroy();}catch{}} hbInstanceRef.current=null; };
  },[phase,embedUrl]);

  useEffect(()=>{
    // Check if session already exists for this conv
    sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-session&order=ts.desc&limit=1`).then(rows=>{
      if(rows&&rows.length>0){
        const d=JSON.parse(rows[0].data||"{}");
        if(d.embed_url){ setEmbedUrl(d.embed_url); setSessionId(d.session_id); setPhase("active"); }
      }
    });
    chatPollRef.current=setInterval(pollChat,2500);
    memberPollRef.current=setInterval(pollMembers,3000);
    return()=>{ clearInterval(chatPollRef.current); clearInterval(memberPollRef.current); };
  },[]);

  const pollChat=async()=>{
    const msgs=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hbchat&ts=gt.${chatTsRef.current}&order=ts.asc`)||[];
    if(!msgs.length)return;
    chatTsRef.current=Math.max(...msgs.map(m=>m.ts));
    setChatMsgs(prev=>[...prev,...msgs.map(m=>({...JSON.parse(m.data||"{}"),id:m.id}))]);
  };

  const pollMembers=async()=>{
    const rows=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-join&order=ts.asc`)||[];
    const names=[...new Set([cu.display_name,...rows.map(r=>JSON.parse(r.data||"{}").name||"?").filter(Boolean)])];
    setMembers(names);
  };

  const hostParty=async()=>{
    setPhase("loading"); setErr(null);
    try{
      const sess=await createHBSession();
      // Save session to signaling so others can join
      await sb.post("nova_signaling",{id:gid(),conv_id:conv.id+"_hb",from_id:cu.id,type:"hb-session",data:JSON.stringify({embed_url:sess.embed_url,session_id:sess.session_id}),ts:Date.now()});
      isHost.current=true;
      setEmbedUrl(sess.embed_url); setSessionId(sess.session_id); setPhase("active");
    }catch(e){ setErr("Failed to start: "+e.message); setPhase("idle"); }
  };

  const joinParty=async()=>{
    const rows=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-session&order=ts.desc&limit=1`);
    if(!rows||!rows.length){ setErr("No active party found. Ask someone to host first."); return; }
    const d=JSON.parse(rows[0].data||"{}");
    if(!d.embed_url){ setErr("Session URL missing."); return; }
    await sb.post("nova_signaling",{id:gid(),conv_id:conv.id+"_hb",from_id:cu.id,type:"hb-join",data:JSON.stringify({name:cu.display_name}),ts:Date.now()});
    setEmbedUrl(d.embed_url); setSessionId(d.session_id); setPhase("active");
  };

  const endParty=async()=>{
    if(isHost.current&&sessionId){
      try{
        await fetch("/api/hyperbeam",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete",sessionId})});
      }catch{}
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hb`);
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hbchat`);
    }
    onEnd();
  };

  const sendGif=async(url)=>{
    const now=Date.now();
    const msgId=gid();
    const msg={name:cu.display_name,text:`__IMG__${url}`,ts:now};
    setChatMsgs(prev=>[...prev,{...msg,id:msgId}]); // optimistic
    chatTsRef.current=now; // bump so pollChat skips this message
    await sb.post("nova_signaling",{id:msgId,conv_id:conv.id+"_hbchat",from_id:cu.id,type:"hb-chat",data:JSON.stringify(msg),ts:now});
  };
  const sendChat=async()=>{
    if(!chatInput.trim())return;
    const now=Date.now();
    const msgId=gid();
    const msg={name:cu.display_name,text:chatInput.trim(),ts:now};
    setChatMsgs(prev=>[...prev,{...msg,id:msgId}]); // optimistic
    chatTsRef.current=now; // bump so pollChat skips this message
    setChatInput("");
    await sb.post("nova_signaling",{id:msgId,conv_id:conv.id+"_hbchat",from_id:cu.id,type:"hb-chat",data:JSON.stringify(msg),ts:now});
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#000"}}>
      {/* Header */}
      <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,.4)",flexShrink:0}}>
        <span style={{fontSize:18}}>🎬</span>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0",flex:1}}>WATCH PARTY</span>
        {phase==="active"&&(
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {members.slice(0,4).map((n,i)=>(
              <div key={i} style={{fontSize:10,color:"#22C55E",background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.3)",borderRadius:20,padding:"2px 8px"}}>
                {n===cu.display_name?"● You":n}
              </div>
            ))}
            {members.length>4&&<div style={{fontSize:10,color:"#475569"}}>+{members.length-4}</div>}
          </div>
        )}
        <button onClick={endParty} style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#EF4444",fontSize:11,fontFamily:"'Orbitron',sans-serif"}}>
          {isHost.current?"END":"LEAVE"}
        </button>
      </div>

      {phase==="idle"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24}}>
          <div style={{fontSize:52}}>🎬</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:"#E2E8F0"}}>Watch Party</div>
          <div style={{fontSize:13,color:"#64748B",textAlign:"center",maxWidth:320,lineHeight:1.7}}>
            Browse any website together in real-time — Netflix, ESPN+, YouTube, Twitch, anything. Everyone sees the same browser.
          </div>
          {err&&<div style={{fontSize:12,color:"#EF4444",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"8px 14px"}}>{err}</div>}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <Btn onClick={hostParty}>🖥 Host Party</Btn>
            <Btn variant="ghost" onClick={joinParty}>👁 Join Party</Btn>
          </div>
          <div style={{fontSize:11,color:"#334155",textAlign:"center"}}>Host creates a shared virtual browser · Everyone can browse and control it together</div>
        </div>
      )}

      {phase==="loading"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
          <div style={{fontSize:36}}>⏳</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:"#00D4FF"}}>STARTING SESSION...</div>
          <div style={{fontSize:11,color:"#475569"}}>Creating virtual browser, please wait</div>
        </div>
      )}

      {phase==="active"&&embedUrl&&(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Hyperbeam SDK container */}
          <div ref={hbContainerRef} style={{flex:1,background:"#000",minWidth:0}}/>
          {/* Party chat sidebar */}
          <div style={{width:220,flexShrink:0,display:"flex",flexDirection:"column",borderLeft:"1px solid rgba(255,255,255,.07)",background:"rgba(0,0,0,.4)"}}>
            <div style={{padding:"8px 12px",fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",borderBottom:"1px solid rgba(255,255,255,.05)",letterSpacing:".1em"}}>PARTY CHAT</div>
            <div style={{flex:1,overflowY:"auto",padding:"10px",display:"flex",flexDirection:"column",gap:7}}>
              {chatMsgs.length===0&&<div style={{fontSize:11,color:"#334155",textAlign:"center",padding:"20px 0"}}>Chat while you watch!</div>}
              {chatMsgs.map((m,i)=>{
                const isGif=m.text?.startsWith("__IMG__");
                return(
                  <div key={m.id||i}>
                    <span style={{color:m.name===cu.display_name?"#00D4FF":"#8B5CF6",fontWeight:700,fontSize:10}}>{m.name}</span>
                    {isGif
                      ?<img src={m.text.slice(7)} style={{display:"block",maxWidth:"100%",borderRadius:6,marginTop:3}} loading="lazy"/>
                      :<span style={{fontSize:12,color:"#94A3B8"}}> {m.text}</span>
                    }
                  </div>
                );
              })}
            </div>
            {wpGifPicker&&<GifPicker onSelect={url=>{sendGif(url);setWpGifPicker(false);}} onClose={()=>setWpGifPicker(false)}/>}
            <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:4,flexDirection:"column"}}>
              <div style={{display:"flex",gap:4}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendChat();}} placeholder="Say something..." style={{flex:1,fontSize:11,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",outline:"none"}}/>
                <button onClick={()=>setWpGifPicker(true)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:6,padding:"6px 8px",cursor:"pointer",color:"#A78BFA",fontSize:10,fontWeight:700}}>GIF</button>
                <button onClick={sendChat} style={{background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#00D4FF",fontSize:14}}>→</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesPage({cu,users,conversations,setConversations,messages,setMessages}){
  const mob=useIsMobile();
  const [activeConv,setActiveConv]=useState(null);
  const [newMsg,setNewMsg]=useState("");
  const [showNew,setShowNew]=useState(false);
  const [search,setSearch]=useState("");
  const [groupName,setGroupName]=useState("");
  const [selectedUsers,setSelectedUsers]=useState([]);
  const [isGroup,setIsGroup]=useState(false);
  const msgEndRef=useRef(null);
  const pollRef=useRef(null);
  const groupAvatarRef=useRef(null);
  const dmImgRef=useRef(null);
  const [dmUploading,setDmUploading]=useState(false);
  const [inCall,setInCall]=useState(false);
  const [inWatchParty,setInWatchParty]=useState(false);

  const sendImage=async(file)=>{
    if(!file||!activeConv||!cu)return;
    setDmUploading(true);
    const ext=file.name.split(".").pop();
    const path=`dm-${gid()}.${ext}`;
    const url=await sbUp("nova-banners",path,file);
    if(url){
      const m={id:gid(),conv_id:activeConv.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text:`__IMG__${url}`,ts:Date.now()};
      setMessages(prev=>[...prev,m]);
      await sb.post("nova_messages",m);
      await sb.patch("nova_conversations",`?id=eq.${activeConv.id}`,{last_msg:"📷 Photo",last_ts:Date.now(),last_sender:cu.display_name});
      setConversations(prev=>prev.map(c=>c.id===activeConv.id?{...c,last_msg:"📷 Photo",last_ts:Date.now()}:c));
    }
    setDmUploading(false);
  };

  const uploadGroupAvatar=async(convId,file)=>{
    if(!file)return;
    const ext=file.name.split(".").pop();
    const path=`group-${convId}.${ext}`;
    const url=await sbUp("nova-banners",path,file);
    if(url){
      await sb.patch("nova_conversations",`?id=eq.${convId}`,{avatar_url:url});
      setConversations(prev=>prev.map(c=>c.id===convId?{...c,avatar_url:url}:c));
      if(activeConv?.id===convId)setActiveConv(prev=>({...prev,avatar_url:url}));
    }
  };

  const myConvs=conversations.filter(c=>c.members.includes(cu?.id||"")).sort((a,b)=>(b.last_ts||0)-(a.last_ts||0));
  const convMsgs=activeConv?messages.filter(m=>m.conv_id===activeConv.id).sort((a,b)=>a.ts-b.ts):[];
  const showList=!mob||!activeConv;
  const showChat=!mob||!!activeConv;

  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:"smooth"}); },[convMsgs.length]);

  useEffect(()=>{
    if(!activeConv)return;
    const poll=async()=>{
      const data=await sb.get("nova_messages",`?conv_id=eq.${activeConv.id}&order=ts.asc`);
      if(data)setMessages(prev=>[...prev.filter(m=>m.conv_id!==activeConv.id),...data]);
    };
    poll(); pollRef.current=setInterval(poll,3000); return()=>clearInterval(pollRef.current);
  },[activeConv?.id]);

  useEffect(()=>{
    if(!cu)return;
    const t=setInterval(async()=>{
      const data=await sb.get("nova_conversations",`?members=cs.{${cu.id}}`);
      if(data)setConversations(data);
    },5000);
    return()=>clearInterval(t);
  },[cu?.id]);

  const sendMsg=async()=>{
    const text=newMsg.trim(); if(!text||!activeConv||!cu)return;
    const m={id:gid(),conv_id:activeConv.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text,ts:Date.now()};
    setNewMsg(""); setMessages(prev=>[...prev,m]);
    await sb.post("nova_messages",m);
    await sb.patch("nova_conversations",`?id=eq.${activeConv.id}`,{last_msg:text,last_ts:Date.now(),last_sender:cu.display_name});
    setConversations(prev=>prev.map(c=>c.id===activeConv.id?{...c,last_msg:text,last_ts:Date.now()}:c));
  };

  const createConv=async()=>{
    if(!selectedUsers.length||!cu)return;
    const members=[cu.id,...selectedUsers];
    if(members.length>50){alert("Max 50 members");return;}
    const isGrp=members.length>2||isGroup;
    const conv={id:gid(),members,is_group:isGrp,name:isGrp?(groupName||"Group Chat"):null,created_by:cu.id,created_at:Date.now(),last_msg:"",last_ts:Date.now(),last_sender:""};
    const res=await sb.post("nova_conversations",conv);
    if(res){ const newC=Array.isArray(res)?res[0]:res; setConversations(prev=>[newC,...prev]); setActiveConv(newC); }
    setShowNew(false); setSelectedUsers([]); setGroupName(""); setIsGroup(false);
  };

  const getConvName=conv=>{ if(conv.is_group)return conv.name||"Group Chat"; const other=users.find(u=>u.id===conv.members.find(id=>id!==cu?.id)); return other?.display_name||"Unknown"; };
  const getConvAvatar=conv=>users.find(u=>u.id===conv.members.find(id=>id!==cu?.id));

  if(!cu)return (
    <div style={{maxWidth:600,margin:"60px auto",textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>💬</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",color:"#475569"}}>Sign in to use messages</div>
    </div>
  );

  return (
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"0":"24px 16px 60px",height:mob?"calc(100vh - 120px)":"calc(100vh - 62px)",display:"flex",gap:16,overflow:"hidden"}}>

      {showList&&(
        <div style={{width:mob?"100%":280,flexShrink:0,display:"flex",flexDirection:"column",gap:10,padding:mob?"12px 12px 0":0,overflowY:"auto"}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>Messages</div>
            <Btn variant="ghost" size="sm" onClick={()=>setShowNew(true)}>＋ New</Btn>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..."/>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
            {myConvs.filter(c=>getConvName(c).toLowerCase().includes(search.toLowerCase())).map(c=>{
              const isActive=activeConv?.id===c.id;
              return (
                <div key={c.id} onClick={()=>setActiveConv(c)} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",borderRadius:12,background:isActive?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",border:`1px solid ${isActive?"rgba(0,212,255,.3)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .18s"}}>
                  {c.is_group
                    ? <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#00D4FF22,#8B5CF622)",border:"1px solid rgba(0,212,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,overflow:"hidden"}}>{c.avatar_url?<img src={c.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"👥"}</div>
                    : <AvatarCircle user={getConvAvatar(c)} size={40}/>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:isActive?"#00D4FF":"#E2E8F0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{getConvName(c)}</div>
                    <div style={{fontSize:11,color:"#475569",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.last_msg||"No messages yet"}</div>
                    {c.is_group&&<div style={{fontSize:10,color:"#334155"}}>{c.members.length} members</div>}
                  </div>
                </div>
              );
            })}
            {myConvs.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:"#334155"}}>
                <div style={{fontSize:32,marginBottom:8}}>💬</div>
                <div style={{fontSize:13}}>No conversations yet</div>
                <div style={{fontSize:11,marginTop:6}}>Hit + New to start one</div>
              </div>
            )}
          </div>
        </div>
      )}

      {showChat&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",background:"rgba(255,255,255,.02)",border:mob?"none":"1px solid rgba(255,255,255,.07)",borderRadius:mob?0:16,overflow:"hidden"}}>
          {activeConv ? (
            <>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,.2)",flexShrink:0}}>
                {mob&&<button onClick={()=>setActiveConv(null)} style={{background:"none",border:"none",color:"#00D4FF",cursor:"pointer",fontSize:24,lineHeight:1,padding:"0 4px 0 0"}}>‹</button>}
                {activeConv.is_group
                  ? <div style={{position:"relative",flexShrink:0}}>
                      <input type="file" ref={groupAvatarRef} accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)uploadGroupAvatar(activeConv.id,f);e.target.value="";}}/>
                      <div onClick={()=>groupAvatarRef.current.click()} style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#00D4FF22,#8B5CF622)",border:"1px solid rgba(0,212,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer",overflow:"hidden",position:"relative"}} title="Change group photo">
                        {activeConv.avatar_url?<img src={activeConv.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"👥"}
                        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}><span style={{fontSize:14}}>📷</span></div>
                      </div>
                    </div>
                  : <AvatarCircle user={getConvAvatar(activeConv)} size={36}/>
                }
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0"}}>{getConvName(activeConv)}</div>
                  {activeConv.is_group&&<div style={{fontSize:11,color:"#475569"}}>{activeConv.members.length} members · max 50</div>}
                </div>
                {/* Voice call button */}
                <button onClick={()=>{setInWatchParty(false);setInCall(v=>!v);}} title="Voice Call" style={{background:inCall?"rgba(34,197,94,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inCall?"rgba(34,197,94,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inCall?"#22C55E":"#94A3B8"}}>📞</button>
                {/* Watch party button */}
                <button onClick={()=>{setInCall(false);setInWatchParty(v=>!v);}} title="Watch Party" style={{background:inWatchParty?"rgba(139,92,246,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inWatchParty?"rgba(139,92,246,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inWatchParty?"#8B5CF6":"#94A3B8"}}>🎬</button>
              </div>
              {/* Voice Call panel */}
              {inCall&&cu&&activeConv&&(
                <div style={{borderBottom:"1px solid rgba(34,197,94,.2)",flexShrink:0}}>
                  <VoiceCall cu={cu} conv={activeConv} users={users} onEnd={()=>setInCall(false)}/>
                </div>
              )}
              {/* Watch Party — rendered as fullscreen modal below */}
              <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
                {convMsgs.length===0&&(
                  <div style={{textAlign:"center",padding:"60px 20px",color:"#334155"}}>
                    <div style={{fontSize:32,marginBottom:8}}>👋</div>
                    <div style={{fontSize:13}}>Say something!</div>
                  </div>
                )}
                {convMsgs.map((m,i)=>{
                  const isMe=m.author_id===cu.id;
                  const prev=convMsgs[i-1];
                  const showAv=!isMe&&(!prev||prev.author_id!==m.author_id);
                  const author=users.find(u=>u.id===m.author_id);
                  return (
                    <div key={m.id} className="msg-in" style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                      {!isMe&&<div style={{width:28,flexShrink:0}}>{showAv&&<AvatarCircle user={author} size={28}/>}</div>}
                      <div style={{maxWidth:"75%"}}>
                        {showAv&&!isMe&&<div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:3,marginLeft:4}}>{m.author_name}</div>}
                        <div style={{background:isMe?"linear-gradient(135deg,#00D4FF22,#8B5CF622)":"rgba(255,255,255,.06)",border:`1px solid ${isMe?"rgba(0,212,255,.25)":"rgba(255,255,255,.08)"}`,borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:m.text.startsWith("__IMG__")?"4px":"9px 14px",fontSize:14,color:"#E2E8F0",lineHeight:1.5,wordBreak:"break-word",overflow:"hidden"}}>
                          {m.text.startsWith("__IMG__")
                            ?<img src={m.text.slice(7)} style={{maxWidth:240,maxHeight:300,borderRadius:12,display:"block",objectFit:"contain"}} onClick={()=>window.open(m.text.slice(7),"_blank")} />
                            :m.text
                          }
                        </div>
                        <div style={{fontSize:10,color:"#334155",marginTop:3,textAlign:isMe?"right":"left",paddingLeft:4,paddingRight:4}}>{fmtMsg(m.ts)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef}/>
              </div>
              <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                <input type="file" ref={dmImgRef} accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)sendImage(f);e.target.value="";}}/>
                <button onClick={()=>dmImgRef.current.click()} disabled={dmUploading} title="Send photo" style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{dmUploading?"⏳":"📷"}</button>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type a message..." onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} style={{flex:1,borderRadius:24,padding:"10px 18px"}}/>
                <Btn onClick={sendMsg} disabled={!newMsg.trim()}>Send ➤</Btn>
              </div>
            </>
          ) : (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#334155"}}>
              <div style={{fontSize:48}}>💬</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13}}>Select a conversation</div>
              <Btn variant="ghost" size="sm" onClick={()=>setShowNew(true)}>＋ Start New Chat</Btn>
            </div>
          )}
        </div>
      )}

      {/* Watch Party fullscreen modal */}
      {inWatchParty&&cu&&activeConv&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(3,7,18,.97)",display:"flex",flexDirection:"column"}}>
          <WatchParty cu={cu} conv={activeConv} users={users} onEnd={()=>setInWatchParty(false)}/>
        </div>
      )}

      {showNew&&(
        <Modal title="💬 New Conversation" onClose={()=>{setShowNew(false);setSelectedUsers([]);setGroupName("");setIsGroup(false);}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setIsGroup(false)} style={{flex:1,padding:"8px 0",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${!isGroup?"#00D4FF":"rgba(255,255,255,.09)"}`,background:!isGroup?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:!isGroup?"#00D4FF":"#94A3B8"}}>💬 Direct Message</button>
              <button onClick={()=>setIsGroup(true)} style={{flex:1,padding:"8px 0",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${isGroup?"#00D4FF":"rgba(255,255,255,.09)"}`,background:isGroup?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:isGroup?"#00D4FF":"#94A3B8"}}>👥 Group Chat</button>
            </div>
            {isGroup&&<div><Lbl>Group Name</Lbl><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Squad name..."/></div>}
            <div>
              <Lbl>Select Members {selectedUsers.length>0&&`(${selectedUsers.length} selected)`}</Lbl>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:260,overflowY:"auto"}}>
                {users.filter(u=>u.id!==cu.id).map(u=>{
                  const sel=selectedUsers.includes(u.id);
                  return (
                    <div key={u.id} onClick={()=>setSelectedUsers(prev=>sel?prev.filter(x=>x!==u.id):[...prev,u.id])} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:sel?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",border:`1px solid ${sel?"rgba(0,212,255,.3)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .15s"}}>
                      <AvatarCircle user={u} size={34}/>
                      <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</div><div style={{fontSize:11,color:"#475569"}}>@{u.username}</div></div>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?"#00D4FF":"rgba(255,255,255,.2)"}`,background:sel?"#00D4FF":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white"}}>{sel?"✓":""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn variant="muted" onClick={()=>setShowNew(false)}>Cancel</Btn>
              <Btn onClick={createConv} disabled={!selectedUsers.length}>{isGroup?"Create Group":"Start Chat"}</Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

// ─── Profile ───────────────────────────────────────────────────────────────────
function ProfilePage({userId,cu,users,setUsers,navigate,addNotif,navOpts={}}){
  const mob=useIsMobile();
  const u=users.find(x=>x.id===userId);
  const isMe=cu?.id===userId;
  const isOwner=cu?.is_owner;
  const[showFL,setShowFL]=useState(null);
  const[editModal,setEditModal]=useState(null);
  const[showAddClip,setShowAddClip]=useState(false);
  const[showAddSocial,setShowAddSocial]=useState(false);
  const[commentText,setCommentText]=useState("");
  const[comments,setComments]=useState([]);
  const[showTeamPicker,setShowTeamPicker]=useState(null);
  const[replyTo,setReplyTo]=useState(null); // {id, author_name, author_id}
  const[profileTab,setProfileTab]=useState("posts"); // posts | activity
  const[pinnedCards,setPinnedCards]=useState([]);
  const[pinnedPlays,setPinnedPlays]=useState([]);
  const commentsSectionRef=useRef(null);
  useEffect(()=>{
    if(navOpts.scrollToComments){
      setProfileTab("posts");
      setTimeout(()=>commentsSectionRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),400);
    }
  },[navOpts]);
  const[userActivity,setUserActivity]=useState([]); // comments made by this user elsewhere
  const[activityLoading,setActivityLoading]=useState(false);
  const[showGifPicker,setShowGifPicker]=useState(false);

  useEffect(()=>{
    if(!u)return;
    loadComments();
    // Load pinned cards
    sb.get("nova_user_cards",`?user_id=eq.${userId}&pinned=eq.true&order=pin_order.asc`).then(rows=>{
      if(!rows?.length){setPinnedCards([]);return;}
      // Fix any old ESPN headshot URLs
      setPinnedCards(rows.map(card=>{
        if(card.card_type==="player"&&card.player_id&&(!card.headshot_url||card.headshot_url.includes("espncdn")))
          return{...card,headshot_url:mlbPlayerHeadshot(card.player_id)};
        if(card.card_type==="team"&&card.card_def_id&&(!card.headshot_url||card.headshot_url.includes("espncdn")))
          return{...card,headshot_url:mlbTeamLogo(card.card_def_id.replace("mlb_team_",""))};
        return card;
      }));
    });
    // Load pinned plays
    sb.get("nova_user_plays",`?user_id=eq.${userId}&pinned=eq.true&order=acquired_at.desc`).then(rows=>{
      setPinnedPlays(rows||[]);
    });
  },[userId]);
  useEffect(()=>{
    if(profileTab==="activity"&&userActivity.length===0){
      setActivityLoading(true);
      sb.get("nova_comments",`?author_id=eq.${userId}&order=timestamp.desc&limit=80`)
        .then(rows=>{setUserActivity(rows||[]);setActivityLoading(false);});
    }
  },[profileTab,userId]);
  const loadComments=async()=>{
    const data=await sb.get("nova_comments",`?profile_user_id=eq.${userId}&order=timestamp.desc`);
    if(data)setComments(data);
  };

  if(!u)return <div style={{padding:"100px 20px",textAlign:"center",color:"#334155"}}>User not found</div>;

  const accent=u.page_accent||"#00D4FF";
  const isFollowing=cu&&(cu.following||[]).includes(u.id);
  const following=async()=>{
    if(!cu||isMe)return;
    const myFollowing=cu.following||[];const theirFollowers=u.followers||[];
    const nowF=isFollowing;
    const newMF=nowF?myFollowing.filter(x=>x!==u.id):[...myFollowing,u.id];
    const newTF=nowF?theirFollowers.filter(x=>x!==cu.id):[...theirFollowers,cu.id];
    await sb.patch("nova_users",`?id=eq.${cu.id}`,{following:newMF});
    await sb.patch("nova_users",`?id=eq.${u.id}`,{followers:newTF});
    setUsers(prev=>prev.map(x=>x.id===cu.id?{...x,following:newMF}:x.id===u.id?{...x,followers:newTF}:x));
    if(!nowF)addNotif(u.id,cu.id,"followed you");
  };
  const patchUser=async patch=>{
    await sb.patch("nova_users",`?id=eq.${u.id}`,patch);
    setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...patch}:x));
  };
  const submitComment=async(imgUrl="")=>{
    if(!commentText.trim()&&!imgUrl||!cu)return;
    const text=imgUrl?`__IMG__${imgUrl}`:commentText.trim();
    const c={id:gid(),profile_user_id:u.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text,timestamp:Date.now(),reply_to:replyTo?.id||null,reply_to_name:replyTo?.author_name||null,likes:[]};
    await sb.post("nova_comments",c);
    setComments(prev=>[c,...prev]);
    setCommentText("");
    setReplyTo(null);
    if(!isMe)addNotif(u.id,cu.id,"commented on your profile");
    // notify person being replied to
    if(replyTo&&replyTo.author_id&&replyTo.author_id!==cu.id&&replyTo.author_id!==u.id){
      addNotif(replyTo.author_id,cu.id,`replied to your comment: "${text.slice(0,50)}"`);
    }
  };
  const deleteComment=async(cid)=>{
    await sb.del("nova_comments",`?id=eq.${cid}`);
    setComments(prev=>prev.filter(c=>c.id!==cid));
  };
  const addClip=async(clip)=>{
    const clips=[...(u.page_clips||[]),clip];
    await patchUser({page_clips:clips});
    setShowAddClip(false);
  };
  const deleteClip=async(cid)=>{
    const clips=(u.page_clips||[]).filter(c=>c.id!==cid);
    await patchUser({page_clips:clips});
  };
  const addSocial=async(entry)=>{
    const s=[...(u.page_social||[]),entry];
    await patchUser({page_social:s});
    setShowAddSocial(false);
  };
  const deleteSocial=async(sid)=>{
    const s=(u.page_social||[]).filter(x=>x.id!==sid);
    await patchUser({page_social:s});
  };
  const handleBannerUpload=async(f,slot)=>{
    const url=await sb.uploadBanner(u.id,f,slot);
    if(url)await patchUser({[`banner_${slot}_url`]:url});
  };

  const likes={};
  const bannerSlots=["top","left","right"];
  const hasSideBanners=(u.banner_left_url||u.banner_right_url);

  // Support up to 4 tracks — page_music is now an array; handle legacy single-object
  const musicTracks=(()=>{
    const pm=u.page_music;
    if(!pm)return[];
    if(Array.isArray(pm))return pm.filter(t=>t?.url);
    if(pm.url)return[pm]; // legacy single
    return[];
  })();
  const dobAge=u.dob?Math.floor((Date.now()-new Date(u.dob))/(1000*60*60*24*365.25)):null;

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"0 0 80px":"24px 20px 80px"}}>
      {showFL&&<FLModal type={showFL} user={u} users={users} navigate={navigate} onClose={()=>setShowFL(null)}/>}

      {/* Header */}
      <Card style={{padding:0,overflow:"hidden",marginBottom:20}}>
        {u.banner_top_url
          ?<div style={{height:mob?100:140,background:`url(${u.banner_top_url}) center/cover`,position:"relative"}}>
            {(isMe||isOwner)&&<div style={{position:"absolute",top:8,right:8}}><BannerBtn label="📷 Top" onUpload={f=>handleBannerUpload(f,"top")}/></div>}
          </div>
          :<div style={{height:mob?80:120,background:`linear-gradient(135deg,${accent}22,rgba(139,92,246,.15),rgba(0,0,0,.3))`,position:"relative"}}>
            {(isMe||isOwner)&&<div style={{position:"absolute",top:8,right:8}}><BannerBtn label="📷 Top Banner" onUpload={f=>handleBannerUpload(f,"top")}/></div>}
          </div>
        }
        <div style={{padding:mob?"16px 14px 16px":"20px 24px 20px",display:"flex",gap:mob?10:16,alignItems:"flex-start",flexWrap:mob?"wrap":"nowrap"}}>
          <div style={{position:"relative",flexShrink:0,marginTop:-30}}>
            <div style={{width:mob?64:82,height:mob?64:82,borderRadius:"50%",background:`radial-gradient(circle,${accent}55,rgba(0,0,0,.7))`,border:`3px solid ${accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?28:38,overflow:"hidden",boxShadow:`0 0 28px ${accent}44`}}>
              {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
            </div>
            <StatusDot type={u.status_type||"offline"} size={mob?12:14} style={{position:"absolute",bottom:2,right:2}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:5}}>
              <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:21,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</h1>
              {u.is_owner&&<RoleBadge color="#F59E0B">Owner</RoleBadge>}
              {u.staff_role&&!u.is_owner&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
              {dobAge!==null&&<span style={{fontSize:11,color:"#334155"}}>Age {dobAge}</span>}
            </div>
            <div style={{fontSize:12,color:"#334155",marginBottom:8}}>@{u.username} · Joined {u.joined||"Nova"}</div>
            {u.bio&&<p style={{color:"#94A3B8",fontSize:14,lineHeight:1.6,marginBottom:8}}>{u.bio}</p>}
            {(u.mlb_team||u.nfl_team||u.nba_team||u.nhl_team)&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{u.mlb_team&&<TeamBadge teamId={u.mlb_team}/>}{u.nfl_team&&<TeamBadge teamId={u.nfl_team}/>}{u.nba_team&&<TeamBadge teamId={u.nba_team}/>}{u.nhl_team&&<TeamBadge teamId={u.nhl_team}/>}</div>}
            <SocialLinks user={u}/>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center",marginTop:10}}>
              <button onClick={()=>setShowFL("followers")} style={{background:"none",border:"none",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10}}><span style={{fontSize:14,fontWeight:900}}>{(u.followers||[]).length}</span> followers</button>
              <button onClick={()=>setShowFL("following")} style={{background:"none",border:"none",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10}}><span style={{fontSize:14,fontWeight:900}}>{(u.following||[]).length}</span> following</button>
              {cu&&!isMe&&<Btn variant={isFollowing?"unfollow":"follow"} size="sm" onClick={following}>{isFollowing?"Unfollow":"Follow"}</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("profile")}>✏️ Edit</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("team")}>⚽ Teams</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("socials")}>🔗 Socials</Btn>}
            </div>
          </div>
        </div>
      </Card>

      {/* Badges */}
      {(u.badges||[]).length>0&&(
        <div style={{marginBottom:20,display:"flex",gap:10,flexWrap:"wrap"}}>
          {(u.badges||[]).map((bid,i)=>{const b=BADGES.find(x=>x.id===bid);if(!b)return null;return(
            <div key={bid} className="badge-pop" style={{animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:7,padding:"5px 12px",borderRadius:20,background:b.color+"14",border:`1.5px solid ${b.color}44`}} title={b.desc}>
              <span style={{fontSize:16}}>{b.icon}</span>
              <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".04em",color:b.color}}>{b.label}</span>
            </div>
          );})}
        </div>
      )}

      {/* Side banners + content */}
      <div style={{display:"flex",gap:16}}>
        {!mob&&hasSideBanners&&(
          <div style={{width:160,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_left_url
              ?<div style={{position:"relative"}}><img src={u.banner_left_url} style={{width:160,borderRadius:12,objectFit:"cover",maxHeight:560}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_left_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Left" onUpload={f=>handleBannerUpload(f,"left")}/>
            }
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          {/* Music */}
          {/* Music tracks (up to 4) */}
          {(musicTracks.length>0||(isMe||isOwner))&&(
            <Card style={{padding:16,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:musicTracks.length>0?10:0}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".15em"}}>🎵 VIBING TO</div>
                {(isMe||isOwner)&&musicTracks.length<4&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("music")}>+ Add Track</Btn>}
              </div>
              {musicTracks.length===0&&(isMe||isOwner)&&(
                <div style={{textAlign:"center",padding:"10px 0"}}><Btn variant="ghost" size="sm" onClick={()=>setEditModal("music")}>🎵 Add Music</Btn></div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {musicTracks.map((track,ti)=>{
                  const tid=track.type==="spotify"?extractSpotify(track.url||""):extractYT(track.url||"");
                  if(!tid)return null;
                  return(
                    <div key={ti} style={{position:"relative"}}>
                      {track.type==="spotify"
                        ?<iframe src={`https://open.spotify.com/embed/track/${tid}?utm_source=generator&theme=0`} width="100%" height="80" frameBorder="0" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture" style={{borderRadius:8,display:"block"}}/>
                        :<iframe src={`https://www.youtube.com/embed/${tid}`} width="100%" height="120" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:8,display:"block"}}/>
                      }
                      {(isMe||isOwner)&&<button onClick={()=>{const nt=musicTracks.filter((_,i)=>i!==ti);patchUser({page_music:nt});}} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.2)",borderRadius:6,color:"#94A3B8",fontSize:11,cursor:"pointer",padding:"2px 7px"}}>✕</button>}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Clips */}
          <Sec title="🎬 Clips" onAdd={isMe||isOwner?()=>setShowAddClip(true):null}>
            <ClipCarousel clips={u.page_clips||[]} canEdit={isMe||isOwner} onDelete={deleteClip} emptyIcon="🎬" emptyMsg="No clips yet" cu={cu} likes={likes} onLike={()=>{}}/>
          </Sec>

          {/* Pinned Cards */}
          {(pinnedCards.length>0||pinnedPlays.length>0)&&(
            <Sec title="⭐ Nova Cards">
              {pinnedCards.length>0&&(
                <div style={{marginBottom:pinnedPlays.length>0?18:0}}>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>CARDS · {pinnedCards.length}</div>
                  <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                    {pinnedCards.map(card=>(
                      <div key={card.id} style={{flexShrink:0}}>
                        <CardDisplay
                          type={card.card_type}
                          name={card.card_name}
                          headshot={card.custom_headshot||card.headshot_url}
                          totalRating={card.total_play_rating||0}
                          customName={card.custom_name||undefined}
                          customBorder={card.custom_border||undefined}
                          customBg={card.custom_bg||undefined}
                          customEffect={card.custom_effect||undefined}
                          size="md"
                          serial={card.serial}
                          pinned
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pinnedPlays.length>0&&(
                <div>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>PLAYS · {pinnedPlays.length}</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
                    {pinnedPlays.map(p=>{
                      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
                      return <div key={p.id} style={{flexShrink:0}}><PlayCard play={pd} size="md"/></div>;
                    })}
                  </div>
                </div>
              )}
            </Sec>
          )}

          {/* Social clips */}
          {((u.page_social||[]).length>0||(isMe||isOwner))&&(
            <Sec title="📱 Social Clips" onAdd={isMe||isOwner?()=>setShowAddSocial(true):null}>
              <ClipCarousel clips={u.page_social||[]} canEdit={isMe||isOwner} onDelete={deleteSocial} emptyIcon="📱" emptyMsg="No social clips"/>
            </Sec>
          )}

          {/* Comments with likes + replies + activity tab */}
          <div ref={commentsSectionRef}/>
          <Sec title="💬 Comments">
            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[["posts","💬 Comments"],["activity","📋 Activity"]].map(([t,l])=>(
                <button key={t} onClick={()=>setProfileTab(t)} style={{padding:"5px 14px",borderRadius:20,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${profileTab===t?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,background:profileTab===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:profileTab===t?"#00D4FF":"#64748B"}}>{l}</button>
              ))}
            </div>

            {profileTab==="activity"?(
              <div>
                {activityLoading&&<div style={{textAlign:"center",padding:30,color:"#334155"}}>Loading activity...</div>}
                {!activityLoading&&userActivity.length===0&&<Empty icon="📋" msg="No comment activity yet"/>}
                {!activityLoading&&userActivity.map(ac=>{
                  const isNews=ac.profile_user_id?.startsWith("news_");
                  const targetUser=!isNews&&users.find(x=>x.id===ac.profile_user_id);
                  const isImg=ac.text?.startsWith("__IMG__");
                  const newsId=isNews?ac.profile_user_id.replace("news_",""):null;
                  const handleActivityClick=()=>{
                    if(isNews){
                      navigate("news",null,{expandId:newsId});
                    } else {
                      navigate("profile",ac.profile_user_id,{scrollToComments:true});
                    }
                  };
                  return(
                    <div key={ac.id} onClick={handleActivityClick} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:8,cursor:"pointer",transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,212,255,.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.06)"}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,color:"#475569",marginBottom:4}}>
                          {isNews
                            ?<><span style={{color:"#8B5CF6",fontWeight:700}}>📰 News</span> · <span style={{color:"#94A3B8"}}>click to view discussion</span></>
                            :<>💬 commented on <span style={{color:"#00D4FF",fontWeight:700}}>{targetUser?.display_name||"someone"}'s profile</span></>
                          }
                          <span style={{marginLeft:8}}>{fmtAgo(ac.timestamp)}</span>
                        </div>
                        {ac.reply_to_name&&<div style={{fontSize:10,color:"#8B5CF6",marginBottom:3}}>↩ replying to {ac.reply_to_name}</div>}
                        {isImg
                          ?<span style={{fontSize:11,color:"#475569"}}>📷 Image</span>
                          :<div style={{fontSize:12,color:"#94A3B8",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ac.text}</div>
                        }
                        {(ac.likes?.length>0)&&<div style={{fontSize:10,color:"#EF4444",marginTop:3}}>❤️ {ac.likes.length}</div>}
                      </div>
                      <span style={{fontSize:14,color:"#334155",flexShrink:0,alignSelf:"center"}}>→</span>
                    </div>
                  );
                })}
              </div>
            ):(
              <>
            {cu&&(
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"flex-start"}}>
                <Av user={cu} size={32}/>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  {replyTo&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderRadius:8,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)"}}>
                      <span style={{fontSize:11,color:"#8B5CF6",flex:1}}>↩ Replying to <strong>{replyTo.author_name}</strong></span>
                      <button onClick={()=>setReplyTo(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:12}}>✕</button>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8}}>
                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}} placeholder={replyTo?`Reply to ${replyTo.author_name}...`:"Leave a comment..."} style={{flex:1}}/>
                    <Btn size="sm" onClick={()=>submitComment()} disabled={!commentText.trim()}>Post</Btn>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <CommentImgUpload onUpload={async f=>{
                      const ext=f.name.split(".").pop();
                      const url=await sbUp("nova-banners",`cmt-${gid()}.${ext}`,f);
                      if(url)submitComment(url);
                    }}/>
                    <button onClick={()=>setShowGifPicker(true)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#A78BFA",fontSize:12,fontWeight:700}}>GIF</button>
                  </div>
                  {showGifPicker&&<GifPicker onSelect={url=>submitComment(`__IMG__${url}`)} onClose={()=>setShowGifPicker(false)}/>}
                </div>
              </div>
            )}
            {comments.length===0?<Empty icon="💬" msg="No comments yet"/>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {comments.map(c=>{
                const author=users.find(x=>x.id===c.author_id);
                const canDel=cu&&(cu.id===u.id||cu.is_owner||cu.staff_role);
                const isImg=c.text?.startsWith("__IMG__");
                const likeCount=c.likes?.length||0;
                const iLiked=cu&&(c.likes||[]).includes(cu.id);
                const toggleLike=()=>{
                  if(!cu)return;
                  const newLikes=iLiked?(c.likes||[]).filter(id=>id!==cu.id):[...(c.likes||[]),cu.id];
                  setComments(prev=>prev.map(x=>x.id===c.id?{...x,likes:newLikes}:x));
                  sb.patch("nova_comments",`?id=eq.${c.id}`,{likes:newLikes});
                };
                return(
                  <div key={c.id} className="comment-row" style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",position:"relative"}}>
                    <Av user={author||{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#00D4FF"}} size={30} onClick={()=>navigate("profile",c.author_id)}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",cursor:"pointer"}} onClick={()=>navigate("profile",c.author_id)}>{c.author_name}</span>
                        <span style={{fontSize:10,color:"#334155"}}>{fmtAgo(c.timestamp)}</span>
                      </div>
                      {c.reply_to_name&&<div style={{fontSize:10,color:"#8B5CF6",marginBottom:3}}>↩ replying to {c.reply_to_name}</div>}
                      {isImg
                        ?<img src={c.text.slice(7)} style={{maxWidth:220,maxHeight:260,borderRadius:10,display:"block",marginTop:4,objectFit:"contain",cursor:"pointer"}} onClick={()=>window.open(c.text.slice(7),"_blank")}/>
                        :<div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{c.text}</div>
                      }
                      <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6}}>
                        <button onClick={toggleLike} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:cu?"pointer":"default",padding:0}}>
                          <span style={{fontSize:13,filter:iLiked?"none":"grayscale(1)",opacity:iLiked?1:.5}}>❤️</span>
                          {likeCount>0&&<span style={{fontSize:10,color:iLiked?"#EF4444":"#475569",fontWeight:700}}>{likeCount}</span>}
                        </button>
                        {cu&&<button onClick={()=>{setReplyTo({id:c.id,author_name:c.author_name,author_id:c.author_id});setProfileTab("posts");}} style={{fontSize:10,color:"#475569",background:"none",border:"none",cursor:"pointer",padding:0}}>↩ Reply</button>}
                      </div>
                    </div>
                    {canDel&&<XBtn className="del-btn" onClick={()=>deleteComment(c.id)} style={{opacity:0,position:"absolute",top:8,right:8}}/>}
                  </div>
                );
              })}
            </div>}
            </>
            )}
          </Sec>
        </div>
        {!mob&&hasSideBanners&&(
          <div style={{width:160,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_right_url
              ?<div style={{position:"relative"}}><img src={u.banner_right_url} style={{width:160,borderRadius:12,objectFit:"cover",maxHeight:560}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_right_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Right" onUpload={f=>handleBannerUpload(f,"right")}/>
          }
          </div>
        )}
      </div>

      {/* Edit Modals */}
      {editModal==="profile"&&<EditProfileModal u={u} cu={cu} onSave={async p=>{await patchUser(p);setEditModal(null);setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...p}:x));}} onClose={()=>setEditModal(null)}/>}
      {editModal==="music"&&<Modal title="🎵 Set Music" onClose={()=>setEditModal(null)}><EditMusicModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
      {editModal==="team"&&<Modal title="🏆 Favorite Teams" onClose={()=>setEditModal(null)} width={580}><EditTeamsModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
      {editModal==="socials"&&<Modal title="🔗 Social Links" onClose={()=>setEditModal(null)}><EditSocialsModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}

      {showAddClip&&<AddClipModal uid={u.id} onAdd={addClip} onClose={()=>setShowAddClip(false)}/>}
      {showAddSocial&&<Modal title="📱 Add Social Clip" onClose={()=>setShowAddSocial(false)}><AddLinkClipModal onAdd={addSocial} onClose={()=>setShowAddSocial(false)}/></Modal>}
    </div>
  );
}

function EditProfileModal({u,cu,onSave,onClose}){
  const[display,setDisplay]=useState(u.display_name||"");
  const[bio,setBio]=useState(u.bio||"");
  const[avatar,setAvatar]=useState(u.avatar||"");
  const[accent,setAccent]=useState(u.page_accent||"#00D4FF");
  const[status,setStatus]=useState(u.status_type||"online");
  const[activity,setActivity]=useState(u.status_activity||"");
  const[dob,setDob]=useState(u.dob||"");
  const[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const handleAv=async e=>{const f=e.target.files[0];if(!f)return;setUploading(true);const url=await sb.upload(u.id,f);if(url)await onSave({avatar_url:url});setUploading(false);};
  return(
    <Modal title="✏️ Edit Profile" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><Lbl>Display Name</Lbl><input value={display} onChange={e=>setDisplay(e.target.value)} placeholder="Your name"/></div>
        <div><Lbl>Bio</Lbl><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell everyone about yourself" style={{resize:"vertical",minHeight:70}}/></div>
        <div><Lbl>Avatar Emoji</Lbl><input value={avatar} onChange={e=>setAvatar(e.target.value)} placeholder="Paste an emoji 🚀"/></div>
        <div><Lbl>Upload Avatar</Lbl><input type="file" ref={fileRef} accept="image/*" onChange={handleAv} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>fileRef.current.click()} disabled={uploading}>{uploading?"Uploading...":"📷 Upload Photo"}</Btn></div>
        <div><Lbl>Date of Birth</Lbl><input type="date" value={dob} onChange={e=>setDob(e.target.value)}/></div>
        <div><Lbl>Accent Color</Lbl><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#00D4FF","#8B5CF6","#F59E0B","#EF4444","#22C55E","#EC4899","#F97316","#A78BFA"].map(c=><button key={c} onClick={()=>setAccent(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${accent===c?"white":"transparent"}`,cursor:"pointer"}}/> )}<input type="color" value={accent} onChange={e=>setAccent(e.target.value)} style={{width:28,height:28,padding:0,border:"none",background:"none",cursor:"pointer"}}/></div></div>
        <div><Lbl>Status</Lbl><select value={status} onChange={e=>setStatus(e.target.value)}>{Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
        <div><Lbl>Activity</Lbl><input value={activity} onChange={e=>setActivity(e.target.value)} placeholder="Watching Yankees game..."/></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={()=>onSave({display_name:display,bio,avatar,page_accent:accent,status_type:status,status_activity:activity,dob})}>Save</Btn></div>
      </div>
    </Modal>
  );
}
function EditMusicModal({u,onSave}){
  const[url,setUrl]=useState("");
  const[type,setType]=useState("spotify");
  const tracks=(()=>{const pm=u.page_music;if(!pm)return[];if(Array.isArray(pm))return pm.filter(t=>t?.url);if(pm.url)return[pm];return[];})();
  const save=()=>{
    if(!url.trim())return;
    const newTrack={url:url.trim(),type};
    const updated=[...tracks,newTrack].slice(0,4);
    onSave({page_music:updated});
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {tracks.length>0&&<div style={{fontSize:11,color:"#64748B"}}>{tracks.length}/4 tracks added</div>}
      <div style={{display:"flex",gap:8}}>{["spotify","youtube"].map(t=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${type===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:type===t?"#00D4FF":"#94A3B8"}}>{t==="spotify"?"🟢 Spotify":"🔴 YouTube"}</button>)}</div>
      <div><Lbl>Paste Link</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder={type==="spotify"?"https://open.spotify.com/track/...":"https://youtu.be/..."}/></div>
      <Btn onClick={save} disabled={!url.trim()||tracks.length>=4}>Add Track {tracks.length>=4?"(Full)":""}</Btn>
    </div>
  );
}
function EditTeamsModal({u,onSave}){
  const[mlb,setMlb]=useState(u.mlb_team||"");
  const[nfl,setNfl]=useState(u.nfl_team||"");
  const[nba,setNba]=useState(u.nba_team||"");
  const[nhl,setNhl]=useState(u.nhl_team||"");
  const[tab,setTab]=useState("mlb");
  const tabs=[["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {tabs.map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{flex:1,minWidth:70,padding:"7px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:tab===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:tab===t?"#00D4FF":"#94A3B8"}}>{l}</button>)}
      </div>
      {tab==="mlb"&&<TeamPicker sport="mlb" teams={MLB_TEAMS} value={mlb} onChange={setMlb}/>}
      {tab==="nfl"&&<TeamPicker sport="nfl" teams={NFL_TEAMS} value={nfl} onChange={setNfl}/>}
      {tab==="nba"&&<TeamPicker sport="nba" teams={NBA_TEAMS} value={nba} onChange={setNba}/>}
      {tab==="nhl"&&<TeamPicker sport="nhl" teams={NHL_TEAMS} value={nhl} onChange={setNhl}/>}
      <Btn onClick={()=>onSave({mlb_team:mlb,nfl_team:nfl,nba_team:nba,nhl_team:nhl})}>Save Teams</Btn>
    </div>
  );
}
function EditSocialsModal({u,onSave}){
  const init={roblox:u.social_roblox||"",discord:u.social_discord||"",instagram:u.social_instagram||"",twitter:u.social_twitter||"",youtube:u.social_youtube||""};
  const[vals,setVals]=useState(init);
  const set=(k,v)=>setVals(prev=>({...prev,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {Object.keys(SOCIAL_ICONS).map(k=>(
        <div key={k}><Lbl>{SOCIAL_LABELS[k]}</Lbl><input value={vals[k]} onChange={e=>set(k,e.target.value)} placeholder={k==="discord"?"username#0000":k==="youtube"?"@channel or URL":`@username`}/></div>
      ))}
      <Btn onClick={()=>onSave({social_roblox:vals.roblox,social_discord:vals.discord,social_instagram:vals.instagram,social_twitter:vals.twitter,social_youtube:vals.youtube})}>Save Socials</Btn>
    </div>
  );
}
function AddClipModal({uid,onAdd,onClose}){
  const[type,setType]=useState("url");
  const[title,setTitle]=useState("");
  const[url,setUrl]=useState("");
  const[file,setFile]=useState(null);
  const[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const add=async()=>{
    if(!title)return;
    if(type==="video"){
      if(!file)return;
      setUploading(true);
      const videoUrl=await sb.uploadClip(uid,file);
      setUploading(false);
      if(!videoUrl)return;
      onAdd({id:gid(),type:"video",title,url:videoUrl,ts:Date.now()});
    } else {
      const yt=extractYT(url);
      const med=extractMedal(url);
      if(yt)onAdd({id:gid(),type:"youtube",title,eid:yt,url,ts:Date.now()});
      else if(med)onAdd({id:gid(),type:"medal",title,eid:med,url,ts:Date.now()});
      else onAdd({id:gid(),type:"link",title,url,platform:"other",ts:Date.now()});
    }
  };
  return(
    <Modal title="🎬 Add Clip" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:8}}>{[["url","🔗 URL"],["video","📹 Upload"]].map(([t,l])=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${type===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:type===t?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div>
        <div><Lbl>Title</Lbl><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Clip title"/></div>
        {type==="url"&&<div><Lbl>URL</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="YouTube, Medal.tv, etc."/></div>}
        {type==="video"&&<div><Lbl>Video File</Lbl><input type="file" ref={fileRef} accept="video/*" onChange={e=>setFile(e.target.files[0])} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>fileRef.current.click()}>{file?`✅ ${file.name}`:"Choose Video"}</Btn></div>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={add} disabled={uploading||!title}>{uploading?"Uploading...":"Add Clip"}</Btn></div>
      </div>
    </Modal>
  );
}
function AddLinkClipModal({onAdd,onClose}){
  const[title,setTitle]=useState("");const[url,setUrl]=useState("");const[plat,setPlat]=useState("instagram");
  const add=()=>{if(!title||!url)return;onAdd({id:gid(),type:"link",title,url,platform:plat,ts:Date.now()});};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div><Lbl>Title</Lbl><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Clip title"/></div>
      <div><Lbl>URL</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Instagram reel, etc."/></div>
      <div><Lbl>Platform</Lbl><select value={plat} onChange={e=>setPlat(e.target.value)}><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="other">Other</option></select></div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={add} disabled={!title||!url}>Add</Btn></div>
    </div>
  );
}

// ─── ESPN-Style Stats Page ─────────────────────────────────────────────────────

const STATS_SPORTS=[
  {id:"mlb",label:"MLB",icon:"⚾",espnPath:"baseball/mlb",color:"#22C55E"},
  {id:"nba",label:"NBA",icon:"🏀",espnPath:"basketball/nba",color:"#F59E0B"},
  {id:"nhl",label:"NHL",icon:"🏒",espnPath:"hockey/nhl",color:"#00D4FF"},
  {id:"nfl",label:"NFL",icon:"🏈",espnPath:"football/nfl",color:"#EF4444"},
];

function useESPN(path,deps=[]){
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(false);
  useEffect(()=>{
    if(!path)return;
    setLoading(true);
    fetch(`https://site.api.espn.com/apis/site/v2/sports/${path}`)
      .then(r=>r.ok?r.json():null)
      .then(d=>{setData(d);setLoading(false);})
      .catch(()=>setLoading(false));
  },deps);
  return{data,loading};
}

// ── Player Stats Page ────────────────────────────────────────────────────────
function PlayerStatsPage({playerId,sport,onBack}){
  const mob=useIsMobile();
  const[info,setInfo]=useState(null);
  const[stats,setStats]=useState(null);
  const[splits,setSplits]=useState(null);
  const[gamelog,setGamelog]=useState([]);
  const[tab,setTab]=useState("overview");
  const[loading,setLoading]=useState(true);
  const espnPath=STATS_SPORTS.find(s=>s.id===sport)?.espnPath||"baseball/mlb";

  useEffect(()=>{
    if(!playerId)return;
    setLoading(true);
    setTab("overview");
    setInfo(null);setStats(null);setGamelog([]);
    const load=async()=>{
      try{
        const proxy=async(url)=>{
          const r=await fetch(`/api/hyperbeam?espn_proxy=1&url=${encodeURIComponent(url)}`);
          return r.ok?r.json():null;
        };

        if(sport==="mlb"){
          // MLB Stats API — reliable, no CORS issues, full data
          const [personData,statSeasonData,statLogData]=await Promise.all([
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=currentTeam,team,stats(type=season,season=2025),education,transactions`).then(r=>r.ok?r.json():null).catch(()=>null),
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season,career&leagueListId=mlb_hist&group=hitting,pitching,fielding&sportId=1`).then(r=>r.ok?r.json():null).catch(()=>null),
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=gameLog&season=2025&group=hitting,pitching&sportId=1`).then(r=>r.ok?r.json():null).catch(()=>null),
          ]);
          if(personData?.people?.[0]){
            const p=personData.people[0];
            // Normalize into the same shape the component expects
            setInfo({
              athlete:{
                id:p.id,
                displayName:p.fullName,
                fullName:p.fullName,
                jersey:p.primaryNumber||"",
                position:{displayName:p.primaryPosition?.name||"",name:p.primaryPosition?.name||"",abbreviation:p.primaryPosition?.abbreviation||""},
                team:{displayName:p.currentTeam?.name||"",id:p.currentTeam?.id},
                headshot:{href:`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/${playerId}/headshot/67/current`},
                displayHeight:p.height||"",
                displayWeight:p.weight?`${p.weight} lbs`:"",
                dateOfBirth:p.birthDate||"",
                birthPlace:{city:p.birthCity||"",state:p.birthStateProvince||"",country:p.birthCountry||""},
                college:{name:p.draftInfo?.school||""},
                experience:{years:p.mlbDebutDate?new Date().getFullYear()-parseInt(p.mlbDebutDate.slice(0,4)):null},
                debut:p.mlbDebutDate||"",
                status:{type:{name:p.active?"active":"inactive",description:p.active?"Active":"Inactive"}},
              }
            });
          }
          // Build stats display — separate 2025 season from career
          if(statSeasonData?.stats?.length){
            const cats=[];
            statSeasonData.stats.forEach(sg=>{
              const splits=sg.splits||[];
              // 2025 season split
              const season2025=splits.find(s=>s.season==="2025"&&(s.type?.displayName==="Regular Season"||s.type?.gameType==="R"));
              // Career split
              const career=splits.find(s=>!s.season||s.type?.displayName==="Career"||s.stat?.gamesPlayed>200);
              const fmt=(s,label)=>{
                if(!s?.stat)return null;
                const entries=Object.entries(s.stat).filter(([,v])=>v!==null&&v!==undefined);
                return{
                  displayName:`${sg.group?.displayName?.toUpperCase()||"STATS"} — ${label}`,
                  displayNames:entries.map(([k])=>k.replace(/([A-Z])/g," $1").toUpperCase().trim()),
                  totals:entries.map(([,v])=>typeof v==="number"&&!Number.isInteger(v)?v.toFixed(3):String(v??"")),
                };
              };
              if(season2025)cats.push(fmt(season2025,"2025 Season"));
              if(career&&career!==season2025)cats.push(fmt(career,"Career"));
              if(!season2025&&!career&&splits[0])cats.push(fmt(splits[0],"Stats"));
            });
            setStats({splits:cats.filter(Boolean)});
          }
          // Game log
          if(statLogData?.stats?.[0]?.splits){
            const splits=statLogData.stats[0].splits;
            const rows=splits.slice(0,30).map(s=>({
              date:s.date||"",
              opponent:s.opponent?.name||s.opponent?.abbreviation||"",
              result:"",
              homeAway:s.isHome?"home":"away",
              stats:[{
                labels:Object.keys(s.stat||{}),
                values:Object.values(s.stat||{}).map(v=>typeof v==="number"&&!Number.isInteger(v)?v.toFixed(3):String(v??"")),
              }],
            }));
            setGamelog(rows);
          }
        } else {
          // NBA / NHL / NFL — ESPN via proxy
          const [infoData,statData,logData]=await Promise.all([
            proxy(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes/${playerId}`),
            proxy(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes/${playerId}/stats`),
            proxy(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes/${playerId}/gamelog`),
          ]);
          // ESPN returns {athlete:{...}} — normalize so component always gets athlete key
          if(infoData){
            const normalized=infoData.athlete?infoData:{athlete:infoData};
            // Extract headshot from ESPN data if available
            const ath=normalized.athlete||{};
            if(ath.headshot?.href)ath._headshotHref=ath.headshot.href;
            setInfo(normalized);
          }
          // Stats: ESPN returns {categories:[{displayName,labels,totals}]} or {splits:[...]}
          if(statData){
            // Normalize ESPN stats to {splits:[{displayName, displayNames, labels, totals, _isCurrent, _isCareer}]}
            const rawCats=statData.categories||statData.splits||[];
            // ESPN stats endpoint has seasonTypes array too
            const seasonTypes=statData.seasonTypes||[];
            let cats=[];
            if(seasonTypes.length){
              seasonTypes.forEach(st=>{
                (st.categories||[]).forEach(cat=>{
                  const isCurrent=st.type?.name==="regular"||st.displayName?.includes("2025")||st.displayName?.includes("Season");
                  const isCareer=st.type?.name==="total"||st.displayName?.toLowerCase().includes("career")||st.displayName?.toLowerCase().includes("total");
                  cats.push({
                    displayName:`${cat.displayName||cat.name||"Stats"} — ${isCareer?"Career":st.displayName||"2025"}`,
                    labels:cat.labels||[],
                    displayNames:cat.labels||[],
                    totals:cat.totals||cat.stats||[],
                    _isCareer:isCareer,
                  });
                });
              });
            } else {
              cats=rawCats.map(cat=>({
                displayName:cat.displayName||cat.name||"Stats",
                labels:cat.labels||[],
                displayNames:cat.labels||[],
                totals:cat.totals||cat.stats||[],
              }));
            }
            setStats({splits:cats});
          }
          if(logData){
            const events=logData?.events||{};
            const cats=logData?.seasonTypes?.[0]?.categories||[];
            const rows=[];
            Object.entries(events).forEach(([eid,ev])=>{
              const statsArr=cats.map(cat=>{
                const statEntry=cat.events?.find(e=>e.eventId===eid);
                return{catName:cat.name||"",labels:cat.labels||[],values:statEntry?.stats||[]};
              });
              rows.push({date:ev.gameDate||ev.date||"",opponent:ev.opponent?.displayName||ev.opponent?.abbreviation||"",result:ev.gameResult||"",homeAway:ev.homeAway||"",stats:statsArr});
            });
            setGamelog(rows.slice(0,30));
          }
        }
      }catch(e){console.warn("PlayerStats load error:",e);}
      setLoading(false);
    };
    load();
  },[playerId,sport]);

  const athlete=info?.athlete||info;
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  if(loading)return(
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:10}}>⚙️</div>
      <div style={{color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading player stats...</div>
    </div>
  );

  if(!athlete)return(
    <div style={{textAlign:"center",padding:60}}>
      <div style={{fontSize:36,marginBottom:10}}>🔍</div>
      <div style={{color:"#334155",fontSize:13}}>Player not found</div>
      <button onClick={onBack} style={{marginTop:12,padding:"8px 18px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",cursor:"pointer",fontSize:12}}>← Back</button>
    </div>
  );

  const pos=athlete.position?.displayName||athlete.position?.name||"";
  const team=athlete.team?.displayName||"";
  const headshot=athlete._headshotHref||athlete.headshot?.href||playerHeadshotUrl(playerId,sport);
  const birthDate=athlete.dateOfBirth||athlete.dob||"";
  const height=athlete.displayHeight||athlete.height||"";
  const weight=athlete.displayWeight||athlete.weight||"";
  const experience=athlete.experience?.years;
  const college=athlete.college?.shortName||athlete.college?.name||"";
  const jersey=athlete.jersey||"";

  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:5,fontFamily:"'Orbitron',sans-serif"}}>← BACK</button>

      {/* Player hero */}
      <div style={{background:`linear-gradient(135deg,${ac}18,rgba(0,0,0,.3))`,border:`1px solid ${ac}33`,borderRadius:16,padding:mob?"14px":"20px 24px",marginBottom:16,display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
        <img src={headshot} style={{width:mob?72:96,height:mob?72:96,borderRadius:"50%",objectFit:"cover",objectPosition:"top",background:"rgba(255,255,255,.08)",flexShrink:0,border:`3px solid ${ac}44`}}
          onError={e=>{e.target.src=`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
            <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#E2E8F0",margin:0}}>{athlete.displayName||athlete.fullName||""}</h1>
            {jersey&&<span style={{fontSize:13,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>#{jersey}</span>}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
            <span style={{fontSize:12,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{pos}</span>
            {team&&<span style={{fontSize:12,color:"#64748B"}}>· {team}</span>}
          </div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#475569"}}>
            {height&&<span>📏 {height}</span>}
            {weight&&<span>⚖️ {weight}</span>}
            {birthDate&&<span>🎂 {birthDate.slice(0,10)}</span>}
            {college&&<span>🎓 {college}</span>}
            {experience!=null&&<span>⭐ {experience} yr{experience!==1?"s":""} exp</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
        {[["overview","📊 Overview"],["gamelog","📅 Game Log"],["splits","📈 Splits"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
              border:`1px solid ${tab===t?ac+"88":"rgba(255,255,255,.1)"}`,
              background:tab===t?ac+"18":"rgba(255,255,255,.03)",
              color:tab===t?ac:"#64748B"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Overview — season stats */}
      {tab==="overview"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {(stats?.splits||stats?.categories||[]).map((cat,ci)=>{
            // Handle both MLB Stats API format and ESPN format
            const labels=cat.displayNames||cat.labels||cat.names||[];
            const values=cat.totals||cat.stats||cat.values||[];
            if(!labels.length)return null;
            // Filter out non-useful labels
            const useful=labels.map((l,li)=>({l,v:values[li]})).filter(({l,v})=>
              v!==undefined&&v!==null&&v!==""&&v!=="-.--"&&v!=="---"&&l.length>0
            );
            if(!useful.length)return null;
            return(
              <Card key={ci} style={{padding:"14px 16px"}} hover={false}>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:12,fontWeight:700}}>{cat.displayName||cat.name||`STATS ${ci+1}`}</div>
                <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(auto-fill,minmax(100px,1fr))",gap:8}}>
                  {useful.slice(0,30).map(({l,v},li)=>(
                    <div key={li} style={{textAlign:"center",padding:"10px 6px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                      <div style={{fontSize:mob?15:18,fontWeight:900,color:ac,fontFamily:"'Orbitron',sans-serif",marginBottom:3,lineHeight:1}}>{v||"—"}</div>
                      <div style={{fontSize:8,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".06em",lineHeight:1.2}}>{String(l).slice(0,12)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
          {/* Bio card */}
          {(athlete.birthPlace?.city||athlete.birthPlace?.country)&&(
            <Card style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>BIO</div>
              <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(3,1fr)",gap:8,fontSize:12,color:"#94A3B8"}}>
                {athlete.birthPlace?.city&&<div><span style={{color:"#475569",fontSize:10}}>Hometown</span><br/>{athlete.birthPlace.city}{athlete.birthPlace.state?`, ${athlete.birthPlace.state}`:""}</div>}
                {athlete.birthPlace?.country&&<div><span style={{color:"#475569",fontSize:10}}>Country</span><br/>{athlete.birthPlace.country}</div>}
                {athlete.debut&&<div><span style={{color:"#475569",fontSize:10}}>Debut</span><br/>{athlete.debut}</div>}
                {athlete.status?.type?.description&&<div><span style={{color:"#475569",fontSize:10}}>Status</span><br/><span style={{color:athlete.status.type.name==="active"?"#22C55E":"#EF4444"}}>{athlete.status.type.description}</span></div>}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Game Log */}
      {tab==="gamelog"&&(
        <Card style={{padding:"14px 16px"}} hover={false}>
          {gamelog.length===0&&<Empty icon="📅" msg="No game log available"/>}
          {gamelog.length>0&&(()=>{
            const firstCat=gamelog[0]?.stats?.[0];
            const labels=firstCat?.labels||[];
            return(
              <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:mob?10:11,minWidth:Math.max(400,labels.length*60+160)}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                      <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:80}}>DATE</td>
                      <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:90}}>OPP</td>
                      <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>RESULT</td>
                      {labels.slice(0,15).map((l,li)=>(
                        <td key={li} style={{padding:"6px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,whiteSpace:"nowrap"}}>{l}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gamelog.map((row,ri)=>{
                      const vals=row.stats?.[0]?.values||[];
                      const isW=row.result?.includes("W");
                      const isL=row.result?.includes("L");
                      return(
                        <tr key={ri} style={{background:ri%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                          <td style={{padding:"5px 8px",color:"#64748B",fontSize:10,whiteSpace:"nowrap"}}>{row.date?.slice(0,10)||"—"}</td>
                          <td style={{padding:"5px 8px",color:"#E2E8F0",fontSize:10,fontWeight:600}}>{row.homeAway==="home"?"vs":"@"} {row.opponent}</td>
                          <td style={{padding:"5px 8px",fontSize:10,fontWeight:700,color:isW?"#22C55E":isL?"#EF4444":"#94A3B8"}}>{row.result||"—"}</td>
                          {vals.slice(0,15).map((v,vi)=>(
                            <td key={vi} style={{padding:"5px 6px",textAlign:"center",color:"#94A3B8",fontSize:10}}>{v||"—"}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Splits */}
      {tab==="splits"&&(
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:32,marginBottom:10}}>📈</div>
          <div style={{color:"#475569",fontSize:13}}>Splits coming soon</div>
          <div style={{color:"#334155",fontSize:11,marginTop:4}}>Home/Away, Day/Night, vs RHP/LHP splits</div>
        </div>
      )}
    </div>
  );
}

// ── ESPN Scores section ──────────────────────────────────────────────────────
function ESPNScores({sport,navigate}){
  const mob=useIsMobile();
  const espnPath=STATS_SPORTS.find(s=>s.id===sport)?.espnPath||"baseball/mlb";
  const{data,loading}=useESPN(`${espnPath}/scoreboard`,[sport]);
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  const events=data?.events||[];

  if(loading)return<div style={{textAlign:"center",padding:"40px 0",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading scores...</div>;
  if(!events.length)return<Empty icon={STATS_SPORTS.find(s=>s.id===sport)?.icon||"🏆"} msg="No games today"/>;

  return(
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
      {events.map(ev=>{
        const comp=ev.competitions?.[0];
        const home=comp?.competitors?.find(c=>c.homeAway==="home");
        const away=comp?.competitors?.find(c=>c.homeAway==="away");
        const st=comp?.status?.type;
        const isLive=st?.name==="STATUS_IN_PROGRESS";
        const isFinal=st?.completed;
        const statusText=st?.shortDetail||st?.description||"Scheduled";
        const homeWin=isFinal&&parseInt(home?.score||0)>parseInt(away?.score||0);
        const awayWin=isFinal&&parseInt(away?.score||0)>parseInt(home?.score||0);
        return(
          <div key={ev.id} onClick={()=>navigate("game",{id:ev.id,sport})}
            style={{background:"rgba(255,255,255,.03)",border:`1px solid ${isLive?"rgba(34,197,94,.3)":"rgba(255,255,255,.07)"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=ac+"55"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=isLive?"rgba(34,197,94,.3)":"rgba(255,255,255,.07)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isLive?"#22C55E":isFinal?"#475569":"#00D4FF",fontWeight:700,padding:"2px 8px",borderRadius:10,background:isLive?"rgba(34,197,94,.1)":isFinal?"rgba(71,85,105,.1)":"rgba(0,212,255,.08)",border:`1px solid ${isLive?"rgba(34,197,94,.3)":isFinal?"rgba(71,85,105,.2)":"rgba(0,212,255,.2)"}`}}>
                {isLive?"🔴 LIVE ·":isFinal?"✅ FINAL ·":"🕐"} {statusText}
              </span>
              <span style={{fontSize:9,color:"#334155"}}>📊 Stats</span>
            </div>
            {[{team:away,isWinner:awayWin},{team:home,isWinner:homeWin}].map(({team,isWinner},ti)=>(
              <div key={ti} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",opacity:isFinal&&!isWinner?.7:1}}>
                {team?.team?.logo?<img src={team.team.logo} style={{width:24,height:24,objectFit:"contain",flexShrink:0}} onError={e=>e.target.style.display="none"}/>:<span style={{width:24,height:24,display:"inline-block"}}/>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:isWinner?700:500,color:isWinner?"#E2E8F0":"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{team?.team?.displayName||"TBD"}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{team?.records?.[0]?.summary||""}</div>
                </div>
                <div style={{fontSize:18,fontWeight:900,color:isWinner?"#E2E8F0":"#64748B",fontFamily:"'Orbitron',sans-serif",minWidth:32,textAlign:"right"}}>{(isLive||isFinal)?team?.score||"0":"—"}</div>
                {isWinner&&<div style={{fontSize:10,color:"#22C55E"}}>▶</div>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Player Search ─────────────────────────────────────────────────────────────
function PlayerSearchSection({sport,onSelectPlayer}){
  const mob=useIsMobile();
  const[q,setQ]=useState("");
  const[results,setResults]=useState([]);
  const[searching,setSearching]=useState(false);
  const espnPath=STATS_SPORTS.find(s=>s.id===sport)?.espnPath||"baseball/mlb";
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  useEffect(()=>{
    if(q.length<2){setResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      try{
        // Use our proxy for MLB (MLB Stats API), ESPN for others
        if(sport==="mlb"){
          const r=await fetch(`/api/hyperbeam?search=${encodeURIComponent(q)}&sport=mlb`);
          const d=await r.json();
          setResults((d.athletes||[]).map(a=>({id:String(a.id),name:a.name,team:a.team,position:a.position,sport})));
        } else {
          const searchUrl=`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes?limit=10&searchTerm=${encodeURIComponent(q)}&active=true`;
          const r=await fetch(`/api/hyperbeam?espn_proxy=1&url=${encodeURIComponent(searchUrl)}`);
          if(r.ok){
            const d=await r.json();
            const items=d.items||d.athletes||[];
            setResults(items.slice(0,10).map(a=>({id:String(a.id),name:a.displayName||a.fullName||"",team:a.team?.displayName||"",position:a.position?.abbreviation||a.position?.name||"",sport})));
          }
        }
      }catch(e){setResults([]);}
      setSearching(false);
    },350);
    return()=>clearTimeout(t);
  },[q,sport]);

  // Top players by sport for quick access
  // MLB: MLB Stats API IDs | NBA/NHL/NFL: ESPN IDs
  const TOP_PLAYERS={
    mlb:[
      {id:"592450",name:"Mookie Betts",hs:"592450"},
      {id:"592518",name:"Aaron Judge",hs:"592518"},
      {id:"660271",name:"Shohei Ohtani",hs:"660271"},
      {id:"444482",name:"Freddie Freeman",hs:"444482"},
      {id:"665742",name:"Juan Soto",hs:"665742"},
      {id:"670541",name:"Yordan Alvarez",hs:"670541"},
      {id:"682998",name:"Gunnar Henderson",hs:"682998"},
      {id:"677951",name:"Bobby Witt Jr.",hs:"677951"},
    ],
    nba:[
      {id:"1966",name:"LeBron James",hs:"1966"},
      {id:"4066261",name:"Nikola Jokic",hs:"4066261"},
      {id:"3202",name:"Stephen Curry",hs:"3202"},
      {id:"3136193",name:"Giannis",hs:"3136193"},
      {id:"4066328",name:"Luka Doncic",hs:"4066328"},
      {id:"4431679",name:"SGA",hs:"4431679"},
    ],
    nhl:[
      {id:"3114727",name:"McDavid",hs:"3114727"},
      {id:"3041954",name:"MacKinnon",hs:"3041954"},
      {id:"3114732",name:"Draisaitl",hs:"3114732"},
      {id:"3900177",name:"Matthews",hs:"3900177"},
      {id:"4697890",name:"Kucherov",hs:"4697890"},
    ],
    nfl:[
      {id:"3139477",name:"Mahomes",hs:"3139477"},
      {id:"3054211",name:"Josh Allen",hs:"3054211"},
      {id:"4241389",name:"Lamar Jackson",hs:"4241389"},
      {id:"3916387",name:"J. Jefferson",hs:"3916387"},
      {id:"4035538",name:"Tyreek Hill",hs:"4035538"},
    ],
  };

  return(
    <div>
      <div style={{position:"relative",marginBottom:results.length||searching?0:20}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search any ${sport.toUpperCase()} player…`}
          style={{paddingRight:36}}/>
        {searching&&<div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:14}} className="spin">⚙️</div>}
      </div>

      {/* Search results dropdown */}
      {(results.length>0||searching)&&q.length>=2&&(
        <div style={{background:"linear-gradient(160deg,#0c1220,#0d1528)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,marginTop:4,marginBottom:16,overflow:"hidden",boxShadow:"0 12px 36px rgba(0,0,0,.7)"}}>
          {searching&&<div style={{padding:"10px 14px",fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>Searching...</div>}
          {results.map(p=>(
            <button key={p.id} onClick={()=>{onSelectPlayer(p.id,p.sport||sport);setQ("");setResults([]);}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,.05)",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,.05)",flexShrink:0}}>
                <img src={playerHeadshotUrl(p.id,sport)}
                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={e=>{e.target.style.display="none";}}/>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                <div style={{fontSize:10,color:"#475569"}}>{p.position}{p.team?` · ${p.team}`:""}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick picks */}
      {!q&&TOP_PLAYERS[sport]&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>POPULAR PLAYERS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {TOP_PLAYERS[sport].map(p=>(
              <button key={p.id} onClick={()=>onSelectPlayer(p.id,sport)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,background:"rgba(255,255,255,.04)",border:`1px solid ${ac}33`,cursor:"pointer",color:"#E2E8F0",fontSize:12}}>
                <div style={{width:22,height:22,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,.05)",flexShrink:0}}>
                  <img src={playerHeadshotUrl(p.id,sport)}
                    style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                </div>
                {p.name.split(" ").pop()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Stats Page ───────────────────────────────────────────────────────────
function StatsPage({navigate,initPlayer,initSport}){
  const mob=useIsMobile();
  const[sport,setSport]=useState(initSport||"mlb");
  const[section,setSection]=useState(initPlayer?"player":"scores"); // scores | players | standings
  const[selectedPlayer,setSelectedPlayer]=useState(initPlayer||null);
  const[standingsData,setStandingsData]=useState(null);
  const[standingsLoading,setStandingsLoading]=useState(false);
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  // Handle external navigation (from PredictPage clicking a player)
  useEffect(()=>{
    if(initPlayer){setSelectedPlayer(initPlayer);setSection("player");if(initSport)setSport(initSport);}
  },[initPlayer,initSport]);

  const selectPlayer=(pid,sp)=>{
    setSelectedPlayer(pid);
    if(sp)setSport(sp);
    setSection("player");
  };

  const loadStandings=async(sp)=>{
    setStandingsLoading(true);
    try{
      const path=STATS_SPORTS.find(s=>s.id===sp)?.espnPath||"baseball/mlb";
      const r=await fetch(`https://site.api.espn.com/apis/v2/sports/${path}/standings`);
      if(r.ok)setStandingsData(await r.json());
    }catch(e){}
    setStandingsLoading(false);
  };

  useEffect(()=>{
    if(section==="standings")loadStandings(sport);
  },[section,sport]);

  if(section==="player"&&selectedPlayer){
    return<PlayerStatsPage playerId={selectedPlayer} sport={sport} onBack={()=>{setSection("players");setSelectedPlayer(null);}}/>;
  }

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,background:"linear-gradient(135deg,#E2E8F0,#94A3B8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:2}}>📊 STATS CENTER</div>
          <div style={{fontSize:11,color:"#334155"}}>Live scores · Player stats · Standings</div>
        </div>
      </div>

      {/* Sport tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {STATS_SPORTS.map(s=>(
          <button key={s.id} onClick={()=>{setSport(s.id);setSection("scores");}}
            style={{padding:"7px 16px",borderRadius:20,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,flexShrink:0,
              border:`1px solid ${sport===s.id?s.color+"88":"rgba(255,255,255,.1)"}`,
              background:sport===s.id?s.color+"18":"rgba(255,255,255,.03)",
              color:sport===s.id?s.color:"#64748B"}}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{display:"flex",gap:5,marginBottom:16,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:12}}>
        {[["scores","🏟️ Scores"],["players","👤 Players"],["standings","🏆 Standings"]].map(([s,l])=>(
          <button key={s} onClick={()=>setSection(s)}
            style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
              border:"none",background:section===s?"rgba(255,255,255,.08)":"none",
              color:section===s?"#E2E8F0":"#475569"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Scores */}
      {section==="scores"&&<ESPNScores sport={sport} navigate={navigate}/>}

      {/* Players */}
      {section==="players"&&(
        <div>
          <PlayerSearchSection sport={sport} onSelectPlayer={selectPlayer}/>
        </div>
      )}

      {/* Standings */}
      {section==="standings"&&(
        <div>
          {standingsLoading&&<div style={{textAlign:"center",padding:"40px 0",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading standings...</div>}
          {!standingsLoading&&standingsData&&(()=>{
            const groups=standingsData.children||standingsData.standings?.entries||[];
            if(!groups.length)return<Empty icon="🏆" msg="Standings not available"/>;
            return(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {groups.slice(0,8).map((group,gi)=>{
                  const entries=group.standings?.entries||group.entries||[];
                  if(!entries.length)return null;
                  return(
                    <Card key={gi} style={{padding:"14px 16px"}} hover={false}>
                      <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:ac,letterSpacing:".12em",marginBottom:10,fontWeight:700}}>{group.name||group.abbreviation||`Division ${gi+1}`}</div>
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:300}}>
                          <thead>
                            <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                              <td style={{padding:"5px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:130}}>TEAM</td>
                              {(entries[0]?.stats||[]).slice(0,8).map((s,si)=>(
                                <td key={si} style={{padding:"5px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>{s.shortDisplayName||s.abbreviation||s.name}</td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry,ei)=>{
                              const team=entry.team;
                              return(
                                <tr key={ei} style={{background:ei%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                                  <td style={{padding:"6px 8px"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                                      {team?.logos?.[0]?.href&&<img src={team.logos[0].href} style={{width:18,height:18,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>}
                                      <span style={{fontSize:11,fontWeight:600,color:"#E2E8F0"}}>{team?.displayName||team?.name||"—"}</span>
                                    </div>
                                  </td>
                                  {(entry.stats||[]).slice(0,8).map((s,si)=>(
                                    <td key={si} style={{padding:"6px 6px",textAlign:"center",color:"#94A3B8",fontSize:11}}>{s.displayValue||s.value||"—"}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
          {!standingsLoading&&!standingsData&&<Empty icon="🏆" msg="No standings data available"/>}
        </div>
      )}
    </div>
  );
}



// ─── Hub Page (News + Stats + Predict combined) ────────────────────────────────
function HubPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[tab,setTab]=useState("stats");
  const TABS=[
    {id:"stats",  icon:"📊",label:"Stats"},
    {id:"news",   icon:"📰",label:"News"},
    {id:"predict",icon:"🎯",label:"Predict"},
  ];
  return(
    <div style={{maxWidth:1080,margin:"0 auto",paddingTop:mob?8:16}}>
      {/* Sub-tab bar */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid rgba(255,255,255,.07)",marginBottom:0,padding:mob?"0 12px":"0 20px"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"10px 18px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:mob?9:11,fontWeight:700,
              border:"none",background:"none",
              borderBottom:`2px solid ${tab===t.id?"#00D4FF":"transparent"}`,
              color:tab===t.id?"#00D4FF":"#475569",
              transition:"all .18s",letterSpacing:".06em",whiteSpace:"nowrap"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {tab==="stats"  &&<StatsPage navigate={navigate}/>}
      {tab==="news"   &&<NewsPage cu={cu} users={users} addNotif={()=>{}} navOpts={{}}/>}
      {tab==="predict"&&<PredictPage cu={cu} users={users} setUsers={setUsers} navigate={navigate}/>}
    </div>
  );
}


// ─── NFFL Page (Football League) ─────────────────────────────────

// ─── LeagueTeamsTab — public Teams page + dashboard team editing ───────────────
function LeagueTeamsTab({teams,players,accentColor,league,cu,onTeamsUpdated,isAdmin,navigate,users}){
  const mob=useIsMobile();
  const[selTeam,setSelTeam]=useState(null);
  const[editing,setEditing]=useState(null); // team being edited
  const[editName,setEditName]=useState("");
  const[editOwner,setEditOwner]=useState("");
  const[editLogo,setEditLogo]=useState("");
  const[saving,setSaving]=useState(false);

  const handleLogoUpload=(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>500000){alert("Logo must be under 500KB");return;}
    const reader=new FileReader();
    reader.onload=ev=>setEditLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const openEdit=(team,e)=>{
    e.stopPropagation();
    setEditing(team);
    setEditName(team.name||"");
    setEditOwner(team.owner_name||"");
    setEditLogo(team.logo||"");
  };

  const saveEdit=async()=>{
    if(!editing)return;
    setSaving(true);
    const patch={name:editName.trim(),owner_name:editOwner.trim(),logo:editLogo};
    await sb.patch(`nova_${league}_teams`,`?id=eq.${editing.id}`,patch);
    onTeamsUpdated(prev=>prev.map(t=>t.id===editing.id?{...t,...patch}:t));
    setSaving(false);
    setEditing(null);
  };

  const teamPlayers=(teamName)=>players.filter(Boolean).filter(p=>p.team===teamName);

  // Detail view for a selected team
  if(selTeam){
    const t=teams.find(x=>x.id===selTeam)||teams[0];
    if(!t)return null;
    const tp=teamPlayers(t.name);
    return(
      <div>
        <button onClick={()=>setSelTeam(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← ALL TEAMS</button>

        {/* Team header */}
        <Card style={{padding:mob?"16px":"20px 24px",marginBottom:16}} hover={false}>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{width:mob?72:88,height:mob?72:88,borderRadius:14,overflow:"hidden",background:`${accentColor}18`,border:`2px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {t.logo?<img src={t.logo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:36}}>🏟</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:24,fontWeight:900,color:"#E2E8F0"}}>{t.name}</div>
              {t.owner_name&&<div style={{fontSize:12,color:accentColor,marginTop:4}}>👑 GM: {t.owner_name}</div>}
              <div style={{fontSize:11,color:"#475569",marginTop:2}}>{tp.length} players</div>
            </div>
            {isAdmin&&(
              <button onClick={(e)=>openEdit(t,e)} style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>✏️ Edit Team</button>
            )}
          </div>
        </Card>

        {/* Team roster */}
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:12}}>ROSTER</div>
        {tp.length===0&&<Empty icon="👥" msg="No players on this team yet"/>}
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:8,marginBottom:16}}>
          {tp.map((p,i)=>{
            const member=p.nova_user_id?users?.find(u=>u.id===p.nova_user_id):null;
            const rid=p.roblox_id||member?.social_roblox||"";
            return(
              <div key={i} onClick={()=>navigate&&navigate("nffl_player",{league,playerId:p.id})}
                style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,cursor:"pointer",transition:"all .18s",alignItems:"center"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor+"55";e.currentTarget.style.background=accentColor+"0a";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=accentColor+"22";e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
                <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {rid?<img src={`/api/roblox-avatar?userId=${rid}`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<span style={{fontSize:18}}>👤</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginTop:1}}>
                    <span style={{fontSize:9,color:accentColor}}>{p.position}</span>
                    {p.jersey&&<span style={{fontSize:9,color:"#334155"}}>#{p.jersey}</span>}
                    {p.ovr&&<span style={{padding:"1px 5px",borderRadius:5,background:ovrColor(p.ovr)+"20",fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,color:ovrColor(p.ovr)}}>{p.ovr}</span>}
                  </div>
                </div>
                <span style={{color:"#334155"}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Edit modal
  if(editing)return(
    <div>
      <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← BACK</button>
      <Card style={{padding:"18px",maxWidth:480}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:14,fontWeight:700}}>✏️ EDIT TEAM</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Logo preview + upload */}
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:64,height:64,borderRadius:12,overflow:"hidden",background:`${accentColor}18`,border:`2px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {editLogo?<img src={editLogo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:28}}>🏟</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>TEAM LOGO</div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{fontSize:10,color:"#94A3B8"}}/>
              {editLogo&&<button onClick={()=>setEditLogo("")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:10,display:"block",marginTop:4}}>Remove logo</button>}
            </div>
          </div>
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>TEAM NAME</div>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Team name…"/>
          </div>
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>GM / TEAM OWNER NAME</div>
            <input value={editOwner} onChange={e=>setEditOwner(e.target.value)} placeholder="e.g. Snow"/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={saveEdit} disabled={saving||!editName.trim()}>{saving?"Saving…":"💾 Save Changes"}</Btn>
            <button onClick={()=>setEditing(null)} style={{padding:"8px 14px",borderRadius:10,background:"none",border:"1px solid rgba(255,255,255,.1)",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>Cancel</button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Team list grid
  return(
    <div>
      {teams.length===0&&<Empty icon="🏟" msg="No teams created yet"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
        {teams.map((t,i)=>{
          const tp=teamPlayers(t.name);
          return(
            <div key={i} onClick={()=>setSelTeam(t.id)}
              style={{borderRadius:16,background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,cursor:"pointer",overflow:"hidden",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor+"66";e.currentTarget.style.background=accentColor+"0a";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=accentColor+"22";e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
              {/* Team banner */}
              <div style={{padding:"16px",display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {t.logo?<img src={t.logo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:28}}>🏟</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                  {t.owner_name&&<div style={{fontSize:11,color:accentColor,marginTop:2}}>👑 {t.owner_name}</div>}
                  <div style={{fontSize:10,color:"#475569",marginTop:2}}>{tp.length} players</div>
                </div>
                {isAdmin&&<button onClick={(e)=>openEdit(t,e)} style={{padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,flexShrink:0}}>✏️</button>}
              </div>
              {/* Mini roster preview */}
              {tp.length>0&&(
                <div style={{borderTop:`1px solid ${accentColor}18`,padding:"10px 16px",display:"flex",gap:6,flexWrap:"wrap"}}>
                  {tp.slice(0,6).map((p,j)=>(
                    <div key={j} style={{fontSize:9,color:"#475569",padding:"2px 7px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)"}}>
                      {p.name.split(" ").slice(-1)[0]} <span style={{color:accentColor}}>{p.position}</span>
                    </div>
                  ))}
                  {tp.length>6&&<div style={{fontSize:9,color:"#334155"}}>+{tp.length-6} more</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function NFFLPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[teams,setTeams]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const load=async()=>{
      const [f,p,t]=await Promise.all([
        sb.get("nova_nffl_feed","?order=ts.desc&limit=50"),
        sb.get("nova_nffl_players","?order=name.asc"),
        sb.get("nova_nffl_teams","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setTeams(t||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"teams",label:"🏟 Teams"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:28}}>🏈</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#F59E0B",letterSpacing:".06em"}}>Football League</div>
          <div style={{fontSize:11,color:"#475569"}}>Football League</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",borderBottom:`2px solid ${tab===t.id?"#F59E0B":"transparent"}`,color:tab===t.id?"#F59E0B":"#475569",transition:"all .18s"}}>{t.label}</button>)}
      </div>
      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading Football League data...</div>}
      {!loading&&tab==="feed"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.length===0&&<Empty icon="🏈" msg="No game feed posts yet — check back soon!"/>}
          {feed.map((f,i)=>(
            <Card key={i} style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:4}}>{f.title||"Update"}</div>
              <div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{f.content||""}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:8,fontFamily:"'Orbitron',sans-serif"}}>{f.ts?new Date(f.ts).toLocaleDateString():""}</div>
            </Card>
          ))}
        </div>
      )}
      {!loading&&tab==="teams"&&(
        <LeagueTeamsTab teams={teams} players={players} accentColor="#F59E0B" league="nffl" cu={cu} onTeamsUpdated={setTeams} isAdmin={isAdmin} navigate={navigate} users={users}/>
      )}
      {!loading&&tab==="stats"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {["Passing","Rushing","Receiving","Defense","Kicking"].map(cat=>(
              <button key={cat} style={{padding:"6px 14px",borderRadius:16,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",color:"#F59E0B",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{cat}</button>
            ))}
          </div>
          <Empty icon="📊" msg="Stats coming soon — add players and game results first"/>
        </div>
      )}
      {!loading&&tab==="players"&&(
        <LeaguePlayersPage players={players} league="nffl" accentColor="#F59E0B" users={users} navigate={navigate}/>
      )}
    </div>
  );
}

// ─── NBBL Page (Baseball League) ─────────────────────────────────────────
function NBBLPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[statCat,setStatCat]=useState("hitting");
  const[teams,setTeams]=useState([]);

  useEffect(()=>{
    const load=async()=>{
      const [f,p,t]=await Promise.all([
        sb.get("nova_nbbl_feed","?order=ts.desc&limit=50"),
        sb.get("nova_nbbl_players","?order=name.asc"),
        sb.get("nova_nbbl_teams","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setTeams(t||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"teams",label:"🏟 Teams"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];

  // Stat categories with their relevant columns
  const STAT_CATS={
    hitting:{label:"⚾ Hitting",color:"#22C55E",cols:["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]},
    pitching:{label:"⚾ Pitching",color:"#3B82F6",cols:["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]},
    fielding:{label:"🧤 Fielding",color:"#A855F7",cols:["G","GS","PO","A","E","DP","FLD%","INN"]},
  };

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:28}}>⚾</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#22C55E",letterSpacing:".06em"}}>Baseball League</div>
          <div style={{fontSize:11,color:"#475569"}}>Baseball League</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",borderBottom:`2px solid ${tab===t.id?"#22C55E":"transparent"}`,color:tab===t.id?"#22C55E":"#475569",transition:"all .18s"}}>{t.label}</button>)}
      </div>
      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading Baseball League data...</div>}
      {!loading&&tab==="feed"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.length===0&&<Empty icon="⚾" msg="No game feed posts yet — check back soon!"/>}
          {feed.map((f,i)=>(
            <Card key={i} style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:11,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:4}}>{f.title||"Update"}</div>
              <div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{f.content||""}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:8,fontFamily:"'Orbitron',sans-serif"}}>{f.ts?new Date(f.ts).toLocaleDateString():""}</div>
            </Card>
          ))}
        </div>
      )}
      {!loading&&tab==="teams"&&(
        <LeagueTeamsTab teams={teams} players={players} accentColor="#22C55E" league="nbbl" cu={cu} onTeamsUpdated={setTeams} isAdmin={isAdmin} navigate={navigate} users={users}/>
      )}
      {!loading&&tab==="stats"&&(
        <div>
          {/* Stat category picker */}
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.entries(STAT_CATS).map(([k,v])=>(
              <button key={k} onClick={()=>setStatCat(k)}
                style={{padding:"7px 16px",borderRadius:18,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                  border:`1px solid ${statCat===k?v.color+"88":"rgba(255,255,255,.1)"}`,
                  background:statCat===k?v.color+"18":"rgba(255,255,255,.03)",
                  color:statCat===k?v.color:"#64748B"}}>
                {v.label}
              </button>
            ))}
          </div>
          {/* Stats table */}
          {(()=>{
            const cat=STAT_CATS[statCat];
            const statPlayers=players.filter(p=>p[`${statCat}_stats`]||p.stats);
            if(!statPlayers.length)return<Empty icon="📊" msg={`No ${statCat} stats recorded yet`}/>;
            return(
              <Card style={{padding:"14px 16px"}} hover={false}>
                <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:400}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                        <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:130}}>PLAYER</td>
                        {cat.cols.map(c=><td key={c} style={{padding:"6px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>{c}</td>)}
                      </tr>
                    </thead>
                    <tbody>
                      {statPlayers.map((p,pi)=>{
                        const s=p[`${statCat}_stats`]||p.stats||{};
                        return(
                          <tr key={pi} style={{background:pi%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                            <td style={{padding:"6px 8px"}}>
                              <div style={{fontWeight:600,color:"#E2E8F0"}}>{p.name}</div>
                              <div style={{fontSize:9,color:"#475569"}}>{p.position} · {p.team}</div>
                            </td>
                            {cat.cols.map(c=><td key={c} style={{padding:"6px 6px",textAlign:"center",color:"#94A3B8",fontSize:11}}>{s[c]??s[c.toLowerCase()]??"—"}</td>)}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })()}
        </div>
      )}
      {!loading&&tab==="players"&&(
        <LeaguePlayersPage players={players} league="nbbl" accentColor="#22C55E" users={users} navigate={navigate}/>
      )}
    </div>
  );
}

// Shared: post to league game feed
function PostFeedForm({league,onPost,cu}){
  const[title,setTitle]=useState("");
  const[content,setContent]=useState("");
  const[saving,setSaving]=useState(false);
  const submit=async()=>{
    if(!content.trim())return;
    setSaving(true);
    const post={id:gid(),title:title.trim(),content:content.trim(),author_id:cu?.id,author_name:cu?.display_name,ts:Date.now()};
    await sb.post(`nova_${league}_feed`,post);
    onPost(post);setTitle("");setContent("");setSaving(false);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Post title (optional)…"/>
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Game update, score, highlights…" rows={3} style={{resize:"vertical"}}/>
      <Btn onClick={submit} disabled={saving||!content.trim()}>{saving?"Posting…":"📢 Post Update"}</Btn>
    </div>
  );
}

// Shared: add player to league roster
function AddLeaguePlayer({league,onAdd,cu,sport="",leagueTeams=[]}){
  const[name,setName]=useState("");
  const[positions_sel,setPositionsSel]=useState([]);
  const[team,setTeam]=useState("");
  const[jersey,setJersey]=useState("");
  const[saving,setSaving]=useState(false);
  const isBaseball=league==="nbbl";
  const isBasketball=league==="ringrush";
  const baseballPos=["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos=["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const basketballPos=["Top","Corner"];
  const positions=isBasketball||sport==="basketball"?basketballPos:isBaseball?baseballPos:footballPos;
  const ac=isBasketball||sport==="basketball"?"#EC4899":isBaseball?"#22C55E":"#F59E0B";
  const togglePos=(pos)=>setPositionsSel(prev=>prev.includes(pos)?prev.filter(x=>x!==pos):[...prev,pos]);
  const submit=async()=>{
    if(!name.trim()||!positions_sel.length)return;
    setSaving(true);
    const player={id:gid(),name:name.trim(),position:positions_sel.join("/"),team:team.trim(),jersey:jersey.trim(),added_by:cu?.id,ts:Date.now()};
    await sb.post(`nova_${league}_players`,player);
    onAdd(player);setName("");setPositionsSel([]);setTeam("");setJersey("");setSaving(false);
  };
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1"}}><Lbl>Player Name</Lbl><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name…"/></div>
      <div style={{gridColumn:"1/-1"}}>
        <Lbl>Position(s) — select all that apply</Lbl>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
          {positions.map(pos=>{
            const sel=positions_sel.includes(pos);
            return(
              <button key={pos} type="button" onClick={()=>togglePos(pos)}
                style={{padding:"4px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                  border:`1px solid ${sel?ac+"88":"rgba(255,255,255,.1)"}`,
                  background:sel?ac+"22":"rgba(255,255,255,.03)",
                  color:sel?ac:"#64748B",transition:"all .15s"}}>
                {pos}
              </button>
            );
          })}
        </div>
        {positions_sel.length>0&&<div style={{fontSize:9,color:ac,marginTop:5,fontFamily:"'Orbitron',sans-serif"}}>Selected: {positions_sel.join(" / ")}</div>}
      </div>
      <div>
        <Lbl>Team</Lbl>
        {leagueTeams.length>0
          ?<select value={team} onChange={e=>setTeam(e.target.value)} style={{width:"100%"}}>
              <option value="">— Free Agent —</option>
              {leagueTeams.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          :<input value={team} onChange={e=>setTeam(e.target.value)} placeholder="Team name…"/>}
      </div>
      <div><Lbl>Jersey #</Lbl><input value={jersey} onChange={e=>setJersey(e.target.value)} placeholder="#"/></div>
      <div style={{gridColumn:"1/-1"}}><Btn onClick={submit} disabled={saving||!name.trim()||!positions_sel.length}>{saving?"Adding…":"➕ Add Player"}</Btn></div>
    </div>
  );
}


// ─── Dashboard ─────────────────────────────────────────────────────────────────

// ─── Ring Rush Page (Basketball League) ───────────────────────────────
function RingRushPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[teams,setTeams]=useState([]);
  const[loading,setLoading]=useState(true);
  const[statCat,setStatCat]=useState("scoring");

  useEffect(()=>{
    const load=async()=>{
      const[f,p,t]=await Promise.all([
        sb.get("nova_ringrush_feed","?order=ts.desc&limit=50"),
        sb.get("nova_ringrush_players","?order=name.asc"),
        sb.get("nova_ringrush_teams","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setTeams(t||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"teams",label:"🏟 Teams"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];
  const ac="#EC4899";

  const STAT_CATS={
    scoring:{label:"🏀 Scoring",color:"#EC4899",cols:["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]},
    rebounds:{label:"💪 Rebounds",color:"#F59E0B",cols:["G","MIN","OREB","DREB","REB","REB/G"]},
    playmaking:{label:"🎯 Playmaking",color:"#22C55E",cols:["G","MIN","AST","TOV","AST/G","AST/TOV"]},
    defense:{label:"🛡 Defense",color:"#3B82F6",cols:["G","MIN","STL","BLK","PF","STL/G","BLK/G"]},
  };

  const posEmoji=(pos)=>({Top:"👑",Corner:"🔥"}[pos]||"🏀");

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <span style={{fontSize:32}}>🏀</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:ac,letterSpacing:".06em"}}>RING RUSH</div>
          <div style={{fontSize:11,color:"#475569"}}>Basketball League</div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",
              borderBottom:`2px solid ${tab===t.id?ac:"transparent"}`,
              color:tab===t.id?ac:"#475569",transition:"all .18s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading Basketball League data...</div>}

      {/* Game Feed */}
      {!loading&&tab==="feed"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.length===0&&<Empty icon="🏀" msg="No game feed posts yet — check back soon!"/>}
          {feed.map((f,i)=>(
            <Card key={i} style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:11,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:4}}>{f.title||"Update"}</div>
              <div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{f.content||""}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:8,fontFamily:"'Orbitron',sans-serif"}}>{f.author_name?`${f.author_name} · `:""}{f.ts?new Date(f.ts).toLocaleDateString():""}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Roster */}
      {!loading&&tab==="teams"&&(
        <LeagueTeamsTab teams={teams} players={players} accentColor={ac} league="ringrush" cu={cu} onTeamsUpdated={setTeams} isAdmin={isAdmin} navigate={navigate} users={users}/>
      )}

      {/* Stats */}
      {!loading&&tab==="stats"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.entries(STAT_CATS).map(([k,v])=>(
              <button key={k} onClick={()=>setStatCat(k)}
                style={{padding:"7px 16px",borderRadius:18,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                  border:`1px solid ${statCat===k?v.color+"88":"rgba(255,255,255,.1)"}`,
                  background:statCat===k?v.color+"18":"rgba(255,255,255,.03)",
                  color:statCat===k?v.color:"#64748B"}}>
                {v.label}
              </button>
            ))}
          </div>
          {(()=>{
            const cat=STAT_CATS[statCat];
            const statKey=`${statCat}_stats`;
            const statPlayers=players.filter(Boolean).filter(p=>p[statKey]&&Object.keys(p[statKey]).length>0);
            if(!statPlayers.length)return<Empty icon="📊" msg={`No ${statCat} stats recorded yet`}/>;
            return(
              <Card style={{padding:"14px 16px"}} hover={false}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                        <td style={{padding:"6px 10px",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",minWidth:120}}>PLAYER</td>
                        {cat.cols.map(c=><td key={c} style={{padding:"6px 8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569"}}>{c}</td>)}
                      </tr>
                    </thead>
                    <tbody>
                      {statPlayers.map((p,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                          <td style={{padding:"7px 10px"}}>
                            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                            <div style={{fontSize:9,color:ac}}>{p.position}</div>
                          </td>
                          {cat.cols.map(c=><td key={c} style={{padding:"7px 8px",textAlign:"center",color:"#94A3B8"}}>{p[statKey]?.[c]||"—"}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Players */}
      {!loading&&tab==="players"&&(
        <LeaguePlayersPage players={players} league="ringrush" accentColor={ac} users={users} navigate={navigate}/>
      )}
    </div>
  );
}


// ─── LeaguePlayersPage — shared player profile page for NFFL/NBBL ─────────────

// ─── Dashboard League flat-tab components ─────────────────────────────────────


// Shared OVR color helper — used by dashboard and member pages
function ovrColor(ovr){
  if(!ovr)return"#64748B";
  if(ovr>=93)return"#A855F7"; // purple - elite
  if(ovr>=87)return"#22C55E"; // green - great
  if(ovr>=80)return"#3B82F6"; // blue - good
  if(ovr>=73)return"#F59E0B"; // gold - above avg
  if(ovr>=65)return"#FB923C"; // orange - average
  return"#64748B";             // grey - below avg
}
function OVRBig({ovr,size=44}){
  const col=ovrColor(ovr);
  return(
    <div style={{width:size,height:size,borderRadius:size*0.22,background:col+"20",border:`2px solid ${col}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:size*0.38,fontWeight:900,color:col,lineHeight:1}}>{ovr||"?"}</span>
    </div>
  );
}

function DashRatingsTab({league,accentColor,label}){
  const mob=useIsMobile();
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[saving,setSaving]=useState({});
  const[editVals,setEditVals]=useState({});
  useEffect(()=>{
    if(loaded)return;
    sb.get(`nova_${league}_players`,"?order=name.asc").then(r=>{
      const p=r||[];
      setPlayers(p);
      const ev={};
      p.forEach(x=>{if(x?.id)ev[x.id]=x.ovr||70;});
      setEditVals(ev);
      setLoaded(true);
    });
  },[]);
  const updateOvr=async(player,newOvr)=>{
    const val=Math.max(40,Math.min(99,parseInt(newOvr)||70));
    setSaving(p=>({...p,[player.id]:true}));
    await sb.patch(`nova_${league}_players`,`?id=eq.${player.id}`,{ovr:val});
    setPlayers(p=>p.map(x=>x.id===player.id?{...x,ovr:val}:x));
    setEditVals(p=>({...p,[player.id]:val}));
    setTimeout(()=>setSaving(p=>({...p,[player.id]:false})),1200);
  };
  return(
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,letterSpacing:".12em",marginBottom:4,fontWeight:700}}>{label} PLAYER RATINGS</div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Edit any player's OVR — 40 min, 99 max. Color updates live.</div>
      {!players.length&&!loaded&&<div style={{color:"#334155",fontSize:11,padding:"20px 0"}}>Loading players...</div>}
      {!players.length&&loaded&&<div style={{color:"#334155",fontSize:11,padding:"20px 0"}}>No players added yet</div>}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {players.filter(Boolean).map((p,i)=>{
          const currentOvr=editVals[p.id]||p.ovr||70;
          return(
            <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
              <OVRBig ovr={currentOvr}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                <div style={{fontSize:10,color:accentColor}}>{p.position}{p.team?` · ${p.team}`:""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <input
                  type="number" min="40" max="99"
                  value={editVals[p.id]||70}
                  onChange={e=>setEditVals(prev=>({...prev,[p.id]:e.target.value}))}
                  onBlur={e=>updateOvr(p,e.target.value)}
                  style={{width:64,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:14,color:ovrColor(parseInt(editVals[p.id])||70)}}
                />
                <div style={{width:14,textAlign:"center"}}>
                  {saving[p.id]&&<span style={{fontSize:14,color:"#22C55E"}}>✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// ─── League Team Management ────────────────────────────────────────────────────

// ─── Dashboard: GM OVR Editor ─────────────────────────────────────────────────
// Lets owner edit OVR ratings for players in their active GM Mode save
function DashGMOvrTab({cu}){
  const mob=useIsMobile();
  const[gmSave,setGmSave]=useState(null);
  const[editVals,setEditVals]=useState({});
  const[saving,setSaving]=useState({});
  const[loaded,setLoaded]=useState(false);
  const[error,setError]=useState("");
  const[searchTeam,setSearchTeam]=useState("");
  const[searchSport,setSearchSport]=useState("mlb");
  const[loadingTeam,setLoadingTeam]=useState(false);
  const[extraRosters,setExtraRosters]=useState({});
  const[activeKey,setActiveKey]=useState("my_save");
  const MY_KEY=`gm2_${cu?.id||"g"}`;

  const loadMySave=()=>{
    try{
      const raw=localStorage.getItem(MY_KEY);
      if(raw){
        const s=JSON.parse(raw);
        setGmSave(s);
        const ev={};
        (s.roster||[]).forEach(p=>{if(p&&p.id)ev[p.id]=String(p.ovr||70);});
        setEditVals(prev=>({...prev,...ev}));
      }
      setLoaded(true);
    }catch(e){setError(e.message);setLoaded(true);}
  };
  useEffect(()=>{loadMySave();},[]);

  const loadTeam=async()=>{
    if(!searchTeam.trim())return;
    const key=`${searchSport}_${searchTeam.trim().toLowerCase().replace(/\s+/g,"_")}`;
    if(extraRosters[key]){setActiveKey(key);return;}
    setLoadingTeam(true);setError("");
    const yr=gmSave?.year||2025;
    const result=await aiCall(
      `Generate the ${yr} ${searchSport.toUpperCase()} roster for "${searchTeam}". Return 20-25 real players with realistic OVR ratings. JSON array: [{id:"p_N",name,pos,age,ovr(50-99),salary(millions float),years(1-6)}]`,
      "You are a sports analyst. Use real player names. Return only valid JSON array."
    );
    if(Array.isArray(result)&&result.length>0){
      const roster=result.map((p,i)=>({...p,id:p.id||`ext_${key}_${i}`}));
      setExtraRosters(prev=>({...prev,[key]:{roster,teamName:searchTeam,sport:searchSport,year:yr}}));
      setActiveKey(key);
      const ev={};
      roster.forEach(p=>{if(p&&p.id)ev[p.id]=String(p.ovr||70);});
      setEditVals(prev=>({...prev,...ev}));
    }else{
      setError("Could not load team — check the name and try again");
    }
    setLoadingTeam(false);
  };

  const saveOvr=(playerId,rawVal)=>{
    const val=Math.max(40,Math.min(99,parseInt(rawVal)||70));
    setSaving(p=>({...p,[playerId]:true}));
    setEditVals(p=>({...p,[playerId]:String(val)}));
    if(activeKey==="my_save"){
      try{
        const raw=localStorage.getItem(MY_KEY);
        if(raw){
          const s=JSON.parse(raw);
          s.roster=(s.roster||[]).map(p=>p&&p.id===playerId?{...p,ovr:val}:p);
          localStorage.setItem(MY_KEY,JSON.stringify(s));
          setGmSave(s);
        }
      }catch(e){console.error(e);}
    }else{
      setExtraRosters(prev=>{
        const next={...prev};
        if(next[activeKey])next[activeKey]={...next[activeKey],roster:next[activeKey].roster.map(p=>p&&p.id===playerId?{...p,ovr:val}:p)};
        return next;
      });
    }
    setTimeout(()=>setSaving(p=>({...p,[playerId]:false})),1000);
  };

  const active=activeKey==="my_save"
    ?{roster:(gmSave?.roster||[]).filter(Boolean),teamName:gmSave?.myTeam?.name||"My Team",sport:gmSave?.sport||"mlb",year:gmSave?.year||2025}
    :extraRosters[activeKey]||{roster:[],teamName:"",sport:searchSport,year:2025};
  const sc=GM_SPORTS.find(s=>s.id===active.sport);
  const ac=sc?.color||"#00D4FF";
  const tabs=[
    {key:"my_save",label:gmSave?.myTeam?.name||"My Save",icon:GM_SPORTS.find(s=>s.id===gmSave?.sport)?.icon||"🎮"},
    ...Object.entries(extraRosters).map(([k,v])=>({key:k,label:v.teamName,icon:GM_SPORTS.find(s=>s.id===v.sport)?.icon||"🏆"}))
  ];

  return(
    <div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#94A3B8",letterSpacing:".12em",marginBottom:4,fontWeight:700}}>🎮 GM — PLAYER OVR EDITOR</div>
      <div style={{fontSize:10,color:"#334155",marginBottom:14}}>Edit OVR for your team OR any other team. Tab out of the input to save.</div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>SPORT</div>
          <select value={searchSport} onChange={e=>setSearchSport(e.target.value)} style={{padding:"6px 8px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
            {GM_SPORTS.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>
        <div style={{flex:1,minWidth:150}}>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>TEAM NAME</div>
          <input value={searchTeam} onChange={e=>setSearchTeam(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadTeam()} placeholder="e.g. Los Angeles Lakers…"/>
        </div>
        <button onClick={loadTeam} disabled={loadingTeam||!searchTeam.trim()} style={{padding:"8px 14px",borderRadius:10,background:"rgba(0,212,255,.12)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:loadingTeam?"wait":"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>{loadingTeam?"Loading…":"Load"}</button>
      </div>
      {error&&<div style={{color:"#EF4444",fontSize:10,marginBottom:10,padding:"6px 10px",borderRadius:8,background:"rgba(239,68,68,.07)"}}>{error} <button onClick={()=>setError("")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",marginLeft:6}}>✕</button></div>}
      {tabs.length>1&&(
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setActiveKey(t.key)} style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:`1px solid ${activeKey===t.key?ac+"66":"rgba(255,255,255,.08)"}`,background:activeKey===t.key?ac+"18":"rgba(255,255,255,.03)",color:activeKey===t.key?ac:"#475569"}}>{t.icon} {t.label}</button>
          ))}
        </div>
      )}
      {!loaded&&<div style={{color:"#334155",padding:"20px 0",textAlign:"center",fontSize:11}}>Loading…</div>}
      {loaded&&active.roster.length===0&&activeKey==="my_save"&&(
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:36,marginBottom:8}}>🎮</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#94A3B8",marginBottom:6}}>No GM Save Found</div>
          <div style={{fontSize:11,color:"#334155"}}>Play GM Mode first, or load any team above.</div>
        </div>
      )}
      {active.roster.length>0&&(
        <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <div style={{padding:"3px 10px",borderRadius:10,background:ac+"18",border:`1px solid ${ac}33`,fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:ac}}>{sc?.icon||"🏆"} {active.teamName}</div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{active.roster.length} PLAYERS</div>
            {activeKey==="my_save"&&<button onClick={loadMySave} style={{padding:"3px 8px",borderRadius:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#475569",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>🔄</button>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[...active.roster].sort((a,b)=>parseInt(editVals[b.id]||b.ovr||70)-parseInt(editVals[a.id]||a.ovr||70)).map((p,i)=>{
              const ovr=parseInt(editVals[p.id]||p.ovr||70);
              return(
                <div key={p.id||i} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
                  <OVRBig ovr={ovr}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:1}}>
                      <span style={{fontSize:10,color:ac}}>{p.pos}</span>
                      {p.age&&<span style={{fontSize:9,color:"#475569"}}>Age {p.age}</span>}
                      {p.salary&&<span style={{fontSize:9,color:"#334155"}}>${typeof p.salary==="number"?p.salary.toFixed(1):p.salary}M{p.years?` · ${p.years}yr`:""}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <input type="number" min="40" max="99" value={editVals[p.id]||ovr} onChange={e=>setEditVals(prev=>({...prev,[p.id]:e.target.value}))} onBlur={e=>saveOvr(p.id,e.target.value)} style={{width:60,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:13,color:ovrColor(ovr)}}/>
                    {saving[p.id]?<span style={{fontSize:13,color:"#22C55E"}}>✓</span>:<span style={{fontSize:9,color:"#334155"}}>OVR</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
function DashLeagueTeams({league,accentColor}){
  const mob=useIsMobile();
  const[teams,setTeams]=useState([]);
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[showAdd,setShowAdd]=useState(false);
  const[teamName,setTeamName]=useState("");
  const[teamOwner,setTeamOwner]=useState("");
  const[logoB64,setLogoB64]=useState("");
  const[saving,setSaving]=useState(false);
  const[deleting,setDeleting]=useState(null);
  const[editing,setEditing]=useState(null);
  const[editName,setEditName]=useState("");
  const[editOwner,setEditOwner]=useState("");
  const[editLogo,setEditLogo]=useState("");
  const[editSaving,setEditSaving]=useState(false);

  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_teams`,"?order=name.asc"),
      sb.get(`nova_${league}_players`,"?order=name.asc"),
    ]).then(([t,p])=>{setTeams(t||[]);setPlayers(p||[]);setLoaded(true);});
  },[]);

  const handleLogo=(e,setter)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>800000){alert("Logo must be under 800KB");return;}
    const reader=new FileReader();
    reader.onload=ev=>setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addTeam=async()=>{
    if(!teamName.trim())return;
    setSaving(true);
    const t={id:gid(),name:teamName.trim(),owner_name:teamOwner.trim(),logo:logoB64||"",league,ts:Date.now()};
    await sb.post(`nova_${league}_teams`,t);
    setTeams(prev=>[...prev,t]);
    setTeamName("");setTeamOwner("");setLogoB64("");setShowAdd(false);setSaving(false);
  };

  const openEdit=(team)=>{
    setEditing(team);
    setEditName(team.name||"");
    setEditOwner(team.owner_name||"");
    setEditLogo(team.logo||"");
  };

  const saveEdit=async()=>{
    if(!editing||!editName.trim())return;
    setEditSaving(true);
    const patch={name:editName.trim(),owner_name:editOwner.trim(),logo:editLogo};
    await sb.patch(`nova_${league}_teams`,`?id=eq.${editing.id}`,patch);
    setTeams(prev=>prev.map(t=>t.id===editing.id?{...t,...patch}:t));
    // Update players whose team name changed
    if(editName.trim()!==editing.name){
      const affected=players.filter(p=>p.team===editing.name);
      await Promise.all(affected.map(p=>sb.patch(`nova_${league}_players`,`?id=eq.${p.id}`,{team:editName.trim()})));
      setPlayers(prev=>prev.map(p=>p.team===editing.name?{...p,team:editName.trim()}:p));
    }
    setEditSaving(false);setEditing(null);
  };

  const deleteTeam=async(id)=>{
    if(!confirm("Delete this team? Players will become free agents."))return;
    setDeleting(id);
    await sb.del(`nova_${league}_teams`,`?id=eq.${id}`);
    setTeams(prev=>prev.filter(t=>t.id!==id));
    setDeleting(null);
  };

  const teamPlayers=(name)=>players.filter(Boolean).filter(p=>p.team===name);

  // Edit view
  if(editing)return(
    <div>
      <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← BACK</button>
      <Card style={{padding:"18px",maxWidth:500}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:14,fontWeight:700}}>✏️ EDIT TEAM</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Logo */}
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:72,height:72,borderRadius:12,overflow:"hidden",background:`${accentColor}18`,border:`2px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {editLogo?<img src={editLogo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:32}}>🏟</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:5}}>TEAM LOGO (max 800KB)</div>
              <input type="file" accept="image/*" onChange={e=>handleLogo(e,setEditLogo)} style={{fontSize:11,color:"#94A3B8"}}/>
              {editLogo&&<button onClick={()=>setEditLogo("")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:10,display:"block",marginTop:4}}>Remove logo</button>}
            </div>
          </div>
          {/* Name */}
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>TEAM NAME</div>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Team name…"/>
            {editName!==editing.name&&<div style={{fontSize:9,color:"#F59E0B",marginTop:3}}>⚠️ Renaming will update all players on this team</div>}
          </div>
          {/* Owner */}
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>GM / TEAM OWNER NAME</div>
            <input value={editOwner} onChange={e=>setEditOwner(e.target.value)} placeholder="Owner's name…"/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={saveEdit} disabled={editSaving||!editName.trim()}>{editSaving?"Saving…":"💾 Save Changes"}</Btn>
            <button onClick={()=>setEditing(null)} style={{padding:"8px 14px",borderRadius:10,background:"none",border:"1px solid rgba(255,255,255,.1)",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>Cancel</button>
          </div>
        </div>
      </Card>
    </div>
  );

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8",fontWeight:700}}>🏟 TEAMS ({teams.length})</div>
        <button onClick={()=>setShowAdd(o=>!o)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,
            background:showAdd?accentColor+"22":"rgba(255,255,255,.05)",
            border:`1px solid ${showAdd?accentColor+"55":"rgba(255,255,255,.1)"}`,
            color:showAdd?accentColor:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>
          {showAdd?"✕ Cancel":"➕ Create Team"}
        </button>
      </div>

      {/* Create form */}
      {showAdd&&(
        <Card style={{padding:"16px",marginBottom:16}} hover={false}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>CREATE TEAM</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:60,height:60,borderRadius:10,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {logoB64?<img src={logoB64} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:26}}>🏟</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>LOGO (max 800KB)</div>
                <input type="file" accept="image/*" onChange={e=>handleLogo(e,setLogoB64)} style={{fontSize:11,color:"#94A3B8"}}/>
              </div>
            </div>
            <div><Lbl>Team Name</Lbl><input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="e.g. Nova Knights…"/></div>
            <div><Lbl>GM / Team Owner Name</Lbl><input value={teamOwner} onChange={e=>setTeamOwner(e.target.value)} placeholder="Owner name…"/></div>
          </div>
          <Btn onClick={addTeam} disabled={saving||!teamName.trim()}>{saving?"Creating…":"✅ Create Team"}</Btn>
        </Card>
      )}

      {!teams.length&&!showAdd&&<Empty icon="🏟" msg="No teams yet — create one above"/>}

      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10}}>
        {teams.map((t,i)=>{
          const tp=teamPlayers(t.name);
          return(
            <Card key={i} style={{padding:0,overflow:"hidden"}} hover={false}>
              <div style={{padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:10,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {t.logo?<img src={t.logo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:24}}>🏟</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                  {t.owner_name&&<div style={{fontSize:10,color:accentColor,marginTop:1}}>👑 {t.owner_name}</div>}
                  <div style={{fontSize:9,color:"#475569",marginTop:1}}>{tp.length} players</div>
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <button onClick={()=>openEdit(t)}
                    style={{padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>✏️ Edit</button>
                  <button onClick={()=>deleteTeam(t.id)} disabled={deleting===t.id}
                    style={{padding:"5px 8px",borderRadius:8,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",cursor:"pointer",fontSize:12,opacity:deleting===t.id?.5:1}}>🗑</button>
                </div>
              </div>
              {tp.length>0&&(
                <div style={{borderTop:`1px solid ${accentColor}14`,padding:"8px 16px",display:"flex",gap:5,flexWrap:"wrap"}}>
                  {tp.slice(0,5).map((p,j)=>(
                    <span key={j} style={{fontSize:9,color:"#475569",padding:"2px 7px",borderRadius:5,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.05)"}}>
                      {p.name.split(" ").slice(-1)[0]} <span style={{color:accentColor}}>{p.position}</span>
                    </span>
                  ))}
                  {tp.length>5&&<span style={{fontSize:9,color:"#334155"}}>+{tp.length-5}</span>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DashLeagueFeed({league,accentColor,cu}){
  const[feed,setFeed]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[title,setTitle]=useState("");
  const[body,setBody]=useState("");
  const[saving,setSaving]=useState(false);
  useEffect(()=>{
    if(loaded)return;
    sb.get(`nova_${league}_feed`,"?order=ts.desc&limit=50").then(r=>{setFeed(r||[]);setLoaded(true);});
  },[]);
  const post=async()=>{
    if(!body.trim())return;
    setSaving(true);
    const p={id:gid(),title:title.trim(),content:body.trim(),author_id:cu?.id,author_name:cu?.display_name,ts:Date.now()};
    await sb.post(`nova_${league}_feed`,p);
    setFeed(prev=>[p,...prev]);setTitle("");setBody("");setSaving(false);
  };
  const del=async(id)=>{await sb.del(`nova_${league}_feed`,`?id=eq.${id}`);setFeed(p=>p.filter(x=>x.id!==id));};
  return(
    <div>
      <Card style={{padding:"16px",marginBottom:14}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:10,fontWeight:700}}>📢 POST GAME UPDATE</div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title (e.g. Week 3 Recap)…" style={{marginBottom:8}}/>
        <textarea value={body} onChange={e=>setBody(e.target.value)} rows={4} placeholder="Game recap, scores, highlights…" style={{marginBottom:8,resize:"vertical"}}/>
        <Btn onClick={post} disabled={saving||!body.trim()}>{saving?"Posting…":"📢 Post Update"}</Btn>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {!feed.length&&<Empty icon="📢" msg="No posts yet"/>}
        {feed.map(f=>(
          <Card key={f.id} style={{padding:"12px 14px"}} hover={false}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                {f.title&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:accentColor,fontWeight:700,marginBottom:4}}>{f.title}</div>}
                <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.5}}>{f.content}</div>
                <div style={{fontSize:9,color:"#334155",marginTop:6}}>{f.author_name} · {new Date(f.ts).toLocaleDateString()}</div>
              </div>
              <button onClick={()=>del(f.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:16,marginLeft:10,flexShrink:0}}>🗑</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashLeagueRoster({league,accentColor,cu,sport=""}){
  const mob=useIsMobile();
  const[players,setPlayers]=useState([]);
  const[leagueTeams,setLeagueTeams]=useState([]);
  const[loaded,setLoaded]=useState(false);
  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_players`,"?order=name.asc"),
      sb.get(`nova_${league}_teams`,"?order=name.asc"),
    ]).then(([p,t])=>{setPlayers(p||[]);setLeagueTeams(t||[]);setLoaded(true);});
  },[]);
  const del=async(id)=>{await sb.del(`nova_${league}_players`,`?id=eq.${id}`);setPlayers(p=>p.filter(x=>x.id!==id));};
  return(
    <div>
      <Card style={{padding:"16px",marginBottom:14}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>➕ ADD PLAYER</div>
        <AddLeaguePlayer league={league} onAdd={p=>setPlayers(prev=>[...prev,p])} cu={cu} sport={sport} leagueTeams={leagueTeams}/>
      </Card>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:10}}>{players.length} PLAYERS</div>
      {!players.length&&<Empty icon="👥" msg="No players yet — add one above"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:8}}>
        {players.filter(Boolean).map((p,i)=>(
          <Card key={i} style={{padding:"12px 14px"}} hover={false}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,color:"#E2E8F0",fontSize:13}}>{p.name}</div>
                <div style={{fontSize:11,color:accentColor,marginTop:2}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</div>
                <div style={{fontSize:10,color:"#475569"}}>{p.team}</div>
              </div>
              <button onClick={()=>del(p.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:14,flexShrink:0}}>🗑</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashLeagueStats({league,accentColor,isBaseball,sport=""}){
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[target,setTarget]=useState("");
  const[statType,setStatType]=useState("season"); // "season" | "career"
  const[field,setField]=useState(()=>sport==="basketball"?"scoring_stats":isBaseball?"hitting_stats":"passing_stats");
  const[data,setData]=useState({});
  const[saving,setSaving]=useState(false);
  const baseballPos=["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos=["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const basketballPos=["Top","Corner"];
  const positions=sport==="basketball"?basketballPos:isBaseball?baseballPos:footballPos;
  // Field key includes _season or _career suffix
  const fullField=statType==="season"?field+"_season":field;
  const NBBL_FIELDS=[
    ["hitting_stats","⚾ Hitting",["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]],
    ["pitching_stats","⚾ Pitching",["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]],
    ["fielding_stats","🧤 Fielding",["G","GS","PO","A","E","DP","FLD%","INN"]],
  ];
  const NFL_FIELDS=[
    ["passing_stats","🎯 Passing",["G","CMP","ATT","YDS","TD","INT","RTG"]],
    ["rushing_stats","🏃 Rushing",["G","CAR","YDS","TD","AVG","LONG"]],
    ["receiving_stats","📡 Receiving",["G","REC","YDS","TD","AVG","LONG"]],
    ["defensive_stats","🛡 Defense",["G","TCK","SACK","INT","FF","PD"]],
    ["kicking_stats","⚽ Kicking",["G","FGM","FGA","FG%","XPM","XPA","LONG"]],
  ];
  const NBA_FIELDS=[
    ["scoring_stats","🏀 Scoring",["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]],
    ["rebounds_stats","💪 Rebounds",["G","OREB","DREB","REB","REB/G"]],
    ["playmaking_stats","🎯 Playmaking",["G","AST","TOV","AST/G","AST/TOV"]],
    ["defense_stats","🛡 Defense",["G","STL","BLK","PF","STL/G","BLK/G"]],
  ];
  const FIELDS=sport==="basketball"?NBA_FIELDS:isBaseball?NBBL_FIELDS:NFL_FIELDS;
  useEffect(()=>{
    if(loaded)return;
    sb.get(`nova_${league}_players`,"?order=name.asc").then(r=>{setPlayers(r||[]);setLoaded(true);});
  },[]);
  const save=async()=>{
    if(!target)return;
    setSaving(true);
    await sb.patch(`nova_${league}_players`,`?id=eq.${target}`,{[fullField]:data});
    setPlayers(p=>p.map(x=>x.id===target?{...x,[fullField]:data}:x));
    setSaving(false);
    alert(`${statType==="season"?"Season":"Career"} stats saved!`);
  };
  const cols=FIELDS.find(([k])=>k===field)?.[2]||[];
  return(
    <Card style={{padding:"18px"}} hover={false}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>📊 ENTER PLAYER STATS</div>
      {/* Season / Career toggle */}
      <div style={{display:"flex",gap:5,marginBottom:14}}>
        {[["season","📅 Current Season"],["career","🏆 Career"]].map(([t,l])=>(
          <button key={t} onClick={()=>{setStatType(t);const p=players.find(x=>x.id===target);const ff=t==="season"?field+"_season":field;setData(p?.[ff]||{});}}
            style={{padding:"6px 14px",borderRadius:12,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
              border:`1px solid ${statType===t?accentColor+"66":"rgba(255,255,255,.08)"}`,
              background:statType===t?accentColor+"18":"rgba(255,255,255,.03)",
              color:statType===t?accentColor:"#475569"}}>
            {l}
          </button>
        ))}
        <div style={{fontSize:9,color:"#334155",display:"flex",alignItems:"center",fontFamily:"'Orbitron',sans-serif",marginLeft:4}}>saving to: {fullField}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div>
          <Lbl>Player</Lbl>
          <select value={target} onChange={e=>{setTarget(e.target.value);const p=players.find(x=>x.id===e.target.value);setData(p?.[fullField]||{});}} style={{width:"100%"}}>
            <option value="">Select player…</option>
            {players.map(p=><option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
          </select>
        </div>
        <div>
          <Lbl>Category</Lbl>
          <select value={field} onChange={e=>{setField(e.target.value);const ff=statType==="season"?e.target.value+"_season":e.target.value;const p=players.find(x=>x.id===target);setData(p?.[ff]||{});}} style={{width:"100%"}}>
            {FIELDS.map(([k,l])=><option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      </div>
      {target&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8,marginBottom:14}}>
            {cols.map(c=>(
              <div key={c}>
                <Lbl>{c}</Lbl>
                <input value={data[c]||""} onChange={e=>setData(p=>({...p,[c]:e.target.value}))} placeholder="—" style={{textAlign:"center"}}/>
              </div>
            ))}
          </div>
          <Btn onClick={save} disabled={saving}>{saving?"Saving…":"💾 Save Stats"}</Btn>
        </>
      )}
      {!target&&<div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontSize:12}}>Select a player above to enter stats</div>}
    </Card>
  );
}

function DashLeagueTx({league,accentColor}){
  const[players,setPlayers]=useState([]);
  const[txs,setTxs]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[type,setType]=useState("Trade");
  const[from,setFrom]=useState("");
  const[to,setTo]=useState("");
  const[desc,setDesc]=useState("");
  const[saving,setSaving]=useState(false);
  const TX_TYPES=["Trade","Signing","Release","Suspension","Injury","Award","Other"];
  const TX_COLOR={Trade:"#00D4FF",Signing:"#22C55E",Release:"#EF4444",Suspension:"#F59E0B",Injury:"#FB923C",Award:"#A855F7",Other:"#64748B"};
  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_players`,"?order=name.asc"),
      sb.get(`nova_${league}_transactions`,"?order=ts.desc&limit=100"),
    ]).then(([p,t])=>{setPlayers(p||[]);setTxs(t||[]);setLoaded(true);});
  },[]);
  const submit=async()=>{
    if(!desc.trim())return;
    setSaving(true);
    const tx={id:gid(),type,from_player:from,to_player:to,description:desc.trim(),ts:Date.now()};
    await sb.post(`nova_${league}_transactions`,tx);
    setTxs(p=>[tx,...p]);setDesc("");setFrom("");setTo("");setSaving(false);
  };
  const del=async(id)=>{await sb.del(`nova_${league}_transactions`,`?id=eq.${id}`);setTxs(p=>p.filter(x=>x.id!==id));};
  const[showForm,setShowForm]=useState(false);
  return(
    <div>
      {/* Header with Add button */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8",fontWeight:700}}>📋 TRANSACTIONS ({txs.length})</div>
        <button onClick={()=>setShowForm(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,background:showForm?accentColor+"22":"rgba(255,255,255,.05)",border:`1px solid ${showForm?accentColor+"55":"rgba(255,255,255,.1)"}`,color:showForm?accentColor:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
          {showForm?"✕ Cancel":"➕ Add Transaction"}
        </button>
      </div>
      {showForm&&(
      <Card style={{padding:"16px",marginBottom:14}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>LOG TRANSACTION</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <Lbl>Type</Lbl>
            <select value={type} onChange={e=>setType(e.target.value)} style={{width:"100%"}}>
              {TX_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Lbl>From Player</Lbl>
            <select value={from} onChange={e=>setFrom(e.target.value)} style={{width:"100%"}}>
              <option value="">—</option>
              {players.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Lbl>To / Team</Lbl>
            <select value={to} onChange={e=>setTo(e.target.value)} style={{width:"100%"}}>
              <option value="">—</option>
              {players.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <Lbl>Description</Lbl>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Aaron Judge traded to Yankees for package…"/>
          </div>
        </div>
        <Btn onClick={()=>{submit();setShowForm(false);}} disabled={saving||!desc.trim()}>{saving?"Saving…":"📋 Log Transaction"}</Btn>
      </Card>
      )}
      {!txs.length&&!showForm&&<Empty icon="📋" msg="No transactions yet — click Add Transaction above"/>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {txs.map(tx=>(
          <Card key={tx.id} style={{padding:"12px 14px"}} hover={false}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{padding:"3px 9px",borderRadius:10,background:`${TX_COLOR[tx.type]||"#64748B"}22`,border:`1px solid ${TX_COLOR[tx.type]||"#64748B"}44`,color:TX_COLOR[tx.type]||"#64748B",fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,marginTop:1}}>{tx.type}</div>
              <div style={{flex:1,minWidth:0}}>
                {(tx.from_player||tx.to_player)&&<div style={{fontSize:10,color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",marginBottom:2}}>{tx.from_player}{tx.from_player&&tx.to_player?" → ":""}{tx.to_player}</div>}
                <div style={{fontSize:12,color:"#94A3B8"}}>{tx.description}</div>
                <div style={{fontSize:9,color:"#334155",marginTop:4}}>{new Date(tx.ts).toLocaleDateString()}</div>
              </div>
              <button onClick={()=>del(tx.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:14,flexShrink:0}}>🗑</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashLeagueMembers({league,accentColor,users,isBaseball,sport=""}){
  const mob=useIsMobile();
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[sel,setSel]=useState(null);
  const[statField,setStatField]=useState(()=>sport==="basketball"?"scoring_stats":isBaseball?"hitting_stats":"passing_stats");
  const[statData,setStatData]=useState({});
  const[saving,setSaving]=useState(false);
  const[statType,setStatType]=useState("season"); // season | career
  const[showAdd,setShowAdd]=useState(false);
  const[addName,setAddName]=useState("");
  const[addPos,setAddPos]=useState([]); // array of positions
  const[addTeam,setAddTeam]=useState("");
  const[addJersey,setAddJersey]=useState("");
  const[addSaving,setAddSaving]=useState(false);
  const baseballPos=["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos=["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const basketballPos=["Top","Corner"];
  const positions=sport==="basketball"?basketballPos:isBaseball?baseballPos:footballPos;
  const addPlayer=async()=>{
    if(!addName.trim()||!addPos.length)return;
    setAddSaving(true);
    const p={id:gid(),name:addName.trim(),position:Array.isArray(addPos)?addPos.join("/"):addPos,team:addTeam.trim(),jersey:addJersey.trim(),ts:Date.now()};
    await sb.post(`nova_${league}_players`,p);
    setPlayers(prev=>[...prev,p]);
    setAddName("");setAddPos("");setAddTeam("");setAddJersey("");
    setShowAdd(false);setAddSaving(false);
  };
  const NBBL_FIELDS=[
    ["hitting_stats","⚾ Hitting",["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]],
    ["pitching_stats","⚾ Pitching",["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]],
    ["fielding_stats","🧤 Fielding",["G","GS","PO","A","E","DP","FLD%","INN"]],
  ];
  const NFL_FIELDS=[
    ["passing_stats","🎯 Passing",["G","CMP","ATT","YDS","TD","INT","RTG"]],
    ["rushing_stats","🏃 Rushing",["G","CAR","YDS","TD","AVG","LONG"]],
    ["receiving_stats","📡 Receiving",["G","REC","YDS","TD","AVG","LONG"]],
    ["defensive_stats","🛡 Defense",["G","TCK","SACK","INT","FF","PD"]],
    ["kicking_stats","⚽ Kicking",["G","FGM","FGA","FG%","XPM","XPA","LONG"]],
  ];
  const NBA_FIELDS=[
    ["scoring_stats","🏀 Scoring",["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]],
    ["rebounds_stats","💪 Rebounds",["G","OREB","DREB","REB","REB/G"]],
    ["playmaking_stats","🎯 Playmaking",["G","AST","TOV","AST/G","AST/TOV"]],
    ["defense_stats","🛡 Defense",["G","STL","BLK","PF","STL/G","BLK/G"]],
  ];
  const FIELDS=(sport||"")==="basketball"?NBA_FIELDS:isBaseball?NBBL_FIELDS:NFL_FIELDS;
  const[leagueTeams,setLeagueTeams]=useState([]);
  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_players`,"?order=name.asc"),
      sb.get(`nova_${league}_teams`,"?order=name.asc"),
    ]).then(([p,t])=>{setPlayers(p||[]);setLeagueTeams(t||[]);setLoaded(true);});
  },[]);
  const matchMember=(nameOrPlayer)=>{
    if(!nameOrPlayer)return null;
    const name=typeof nameOrPlayer==="object"?(nameOrPlayer.name||""):nameOrPlayer;
    if(!name)return null;
    const n=name.toLowerCase();
    return users.find(u=>(u.display_name||"").toLowerCase().includes(n)||n.includes((u.display_name||"").toLowerCase())||(u.username||"").toLowerCase()===n)||null;
  };
  const selPlayer=sel?players.find(p=>p.id===sel):null;
  // Linked Nova member — prefer explicit nova_user_id over name-match
  const linkedMember=selPlayer
    ?(selPlayer.nova_user_id?users.find(u=>u.id===selPlayer.nova_user_id):matchMember(selPlayer.name))
    :null;
  // Roblox: use player's own roblox_id first, fall back to linked member's
  const rId=selPlayer?.roblox_id||linkedMember?.social_roblox||"";
  // Spotify URL stored on player record
  const spotifyUrl=selPlayer?.spotify_url||"";
  // Convert Spotify track/playlist URL to embed URL
  const spotifyEmbed=(url)=>{
    if(!url)return"";
    const m=url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
    return m?`https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`:"";
  };
  const fullStatField=statType==="season"?statField+"_season":statField;
  const saveStats=async()=>{
    if(!selPlayer)return;
    setSaving(true);
    await sb.patch(`nova_${league}_players`,`?id=eq.${selPlayer.id}`,{[fullStatField]:statData});
    setPlayers(p=>p.map(x=>x.id===selPlayer.id?{...x,[fullStatField]:statData}:x));
    setSaving(false);alert(`${statType==="season"?"Season":"Career"} stats saved!`);
  };
  const patchPlayer=async(patch)=>{
    await sb.patch(`nova_${league}_players`,`?id=eq.${selPlayer.id}`,patch);
    setPlayers(p=>p.map(x=>x.id===selPlayer.id?{...x,...patch}:x));
  };
  if(sel&&selPlayer){
    const cols=FIELDS.find(([k])=>k===statField)?.[2]||[];
    const embedUrl=spotifyEmbed(selPlayer.spotify_url||"");
    return(
      <div>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:16,fontFamily:"'Orbitron',sans-serif",display:"flex",alignItems:"center",gap:5}}>← ALL PLAYERS</button>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>

          {/* Left card — profile + linking */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card style={{padding:"16px"}} hover={false}>
              {/* Avatar + name header */}
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                <div style={{position:"relative",width:64,height:64,borderRadius:10,overflow:"hidden",background:`${accentColor}18`,border:`2px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {rId
                    ?<img key={rId} src={`/api/roblox-avatar?userId=${rId}&t=${Date.now()}`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
                    :null}
                  <div style={{display:rId?"none":"flex",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",fontSize:26}}>{sport==="basketball"?"🏀":isBaseball?"⚾":"🏈"}</div>
                </div>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{selPlayer.name}</div>
                  <div style={{fontSize:11,color:accentColor,marginTop:2}}>{selPlayer.position}{selPlayer.jersey?` · #${selPlayer.jersey}`:""}</div>
                  <div style={{fontSize:10,color:"#475569"}}>{selPlayer.team}</div>
                </div>
              </div>

              {/* Basic info editing */}
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:8}}>PLAYER INFO</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                <div><Lbl>Name</Lbl><input defaultValue={selPlayer.name} onBlur={e=>patchPlayer({name:e.target.value})}/></div>
                <div style={{gridColumn:"1/-1"}}>
                  <Lbl>Position(s)</Lbl>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
                    {positions.map(pos=>{
                      const curPositions=(selPlayer.position||"").split("/").map(x=>x.trim()).filter(Boolean);
                      const sel=curPositions.includes(pos);
                      return(
                        <button key={pos} type="button" onClick={()=>{
                          const cur=(selPlayer.position||"").split("/").map(x=>x.trim()).filter(Boolean);
                          const next=sel?cur.filter(x=>x!==pos):[...cur,pos];
                          patchPlayer({position:next.join("/")});
                        }}
                          style={{padding:"4px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                            border:`1px solid ${sel?accentColor+"88":"rgba(255,255,255,.1)"}`,
                            background:sel?accentColor+"22":"rgba(255,255,255,.03)",
                            color:sel?accentColor:"#64748B",transition:"all .15s"}}>
                          {pos}
                        </button>
                      );
                    })}
                  </div>
                  {selPlayer.position&&<div style={{fontSize:9,color:accentColor,marginTop:5,fontFamily:"'Orbitron',sans-serif"}}>{selPlayer.position}</div>}
                </div>
                <div>
                  <Lbl>Team</Lbl>
                  {leagueTeams.length>0
                    ?<select defaultValue={selPlayer.team} onBlur={e=>patchPlayer({team:e.target.value})} onChange={e=>patchPlayer({team:e.target.value})} style={{width:"100%"}}>
                        <option value="">— Free Agent —</option>
                        {leagueTeams.map(t=>(
                          <option key={t.id} value={t.name} selected={selPlayer.team===t.name}>{t.name}</option>
                        ))}
                      </select>
                    :<input defaultValue={selPlayer.team} onBlur={e=>patchPlayer({team:e.target.value})}/>}
                </div>
                <div><Lbl>Jersey #</Lbl><input defaultValue={selPlayer.jersey} onBlur={e=>patchPlayer({jersey:e.target.value})}/></div>
              </div>

              {/* ── Link Nova Account ── */}
              <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:12,marginBottom:14}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:8}}>🔗 LINK NOVA ACCOUNT</div>
                {linkedMember&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(0,212,255,.06)",border:"1px solid rgba(0,212,255,.2)",borderRadius:8,marginBottom:8}}>
                    <Av user={linkedMember} size={28}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{linkedMember.display_name}</div>
                      <div style={{fontSize:10,color:"#475569"}}>@{linkedMember.username}</div>
                    </div>
                    <button onClick={()=>patchPlayer({nova_user_id:null})} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif"}}>Unlink</button>
                  </div>
                )}
                <select
                  value={selPlayer.nova_user_id||""}
                  onChange={e=>patchPlayer({nova_user_id:e.target.value||null})}
                  style={{width:"100%"}}>
                  <option value="">{linkedMember?"Change linked account…":"Search Nova member…"}</option>
                  {[...users].sort((a,b)=>(a.display_name||"").localeCompare(b.display_name||"")).map(u=>(
                    <option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>
                  ))}
                </select>
              </div>

              {/* ── Roblox ID ── */}
              <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:12,marginBottom:14}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:8}}>🎮 ROBLOX ID</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input
                    defaultValue={selPlayer.roblox_id||""}
                    placeholder="Enter Roblox user ID…"
                    style={{flex:1}}
                    onBlur={e=>{
                      const val=e.target.value.trim();
                      patchPlayer({roblox_id:val||null});
                    }}
                  />
                  {rId&&(
                    <div style={{width:36,height:36,borderRadius:8,overflow:"hidden",flexShrink:0,border:`1px solid ${accentColor}44`}}>
                      <img key={rId} src={`/api/roblox-avatar?userId=${rId}`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                    </div>
                  )}
                </div>
                <div style={{fontSize:9,color:"#334155",marginTop:4}}>Find your ID at roblox.com/users — the number in the URL. Avatar auto-updates.</div>
              </div>

              {/* ── Spotify Song ── */}
              <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:12}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:8}}>🎵 ANTHEM / WALK-UP SONG</div>
                <input
                  defaultValue={selPlayer.spotify_url||""}
                  placeholder="Paste Spotify track or playlist URL…"
                  onBlur={e=>{
                    const val=e.target.value.trim();
                    patchPlayer({spotify_url:val||null});
                  }}
                  style={{marginBottom:8}}
                />
                {embedUrl&&(
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{borderRadius:10,border:"none"}}
                  />
                )}
                <div style={{fontSize:9,color:"#334155",marginTop:4}}>Works with Spotify track, album, or playlist links.</div>
              </div>
            </Card>
          </div>

          {/* Right card — stats */}
          <Card style={{padding:"16px"}} hover={false}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:10}}>EDIT STATS</div>
            {/* Season/Career toggle in member detail */}
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              {[["season","📅 Season"],["career","🏆 Career"]].map(([t,l])=>(
                <button key={t} onClick={()=>{setStatType(t);const ff=t==="season"?statField+"_season":statField;setStatData(selPlayer?.[ff]||{});}}
                  style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                    border:`1px solid ${statType===t?accentColor+"66":"rgba(255,255,255,.08)"}`,
                    background:statType===t?accentColor+"18":"rgba(255,255,255,.03)",
                    color:statType===t?accentColor:"#475569"}}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {FIELDS.map(([k,l])=>(
                <button key={k} onClick={()=>{setStatField(k);const ff=statType==="season"?k+"_season":k;setStatData(selPlayer?.[ff]||{});}}
                  style={{padding:"4px 10px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                    border:`1px solid ${statField===k?accentColor+"88":"rgba(255,255,255,.1)"}`,
                    background:statField===k?accentColor+"18":"rgba(255,255,255,.03)",
                    color:statField===k?accentColor:"#64748B"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(72px,1fr))",gap:8,marginBottom:12}}>
              {cols.map(c=>(
                <div key={c}><Lbl>{c}</Lbl><input value={statData[c]||""} onChange={e=>setStatData(p=>({...p,[c]:e.target.value}))} placeholder="—" style={{textAlign:"center"}}/></div>
              ))}
            </div>
            <Btn onClick={saveStats} disabled={saving}>{saving?"Saving…":"💾 Save Stats"}</Btn>
          </Card>
        </div>
      </div>
    );
  }
  return(
    <div>
      {/* Header with Add button */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8",fontWeight:700}}>👤 MEMBER PAGES ({players.length})</div>
        <button onClick={()=>setShowAdd(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,background:showAdd?accentColor+"22":"rgba(255,255,255,.05)",border:`1px solid ${showAdd?accentColor+"55":"rgba(255,255,255,.1)"}`,color:showAdd?accentColor:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
          {showAdd?"✕ Cancel":"➕ Create Member Page"}
        </button>
      </div>
      {showAdd&&(
        <Card style={{padding:"16px",marginBottom:14}} hover={false}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>CREATE MEMBER PAGE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><Lbl>Player Name</Lbl><input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Full name…"/></div>
            <div style={{gridColumn:"1/-1"}}>
              <Lbl>Position(s) — select all that apply</Lbl>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
                {positions.map(pos=>{
                  const sel=addPos.includes(pos);
                  return(
                    <button key={pos} type="button" onClick={()=>setAddPos(prev=>sel?prev.filter(x=>x!==pos):[...prev,pos])}
                      style={{padding:"4px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                        border:`1px solid ${sel?accentColor+"88":"rgba(255,255,255,.1)"}`,
                        background:sel?accentColor+"22":"rgba(255,255,255,.03)",
                        color:sel?accentColor:"#64748B",transition:"all .15s"}}>
                      {pos}
                    </button>
                  );
                })}
              </div>
              {addPos.length>0&&<div style={{fontSize:9,color:accentColor,marginTop:5,fontFamily:"'Orbitron',sans-serif"}}>Selected: {addPos.join(" / ")}</div>}
            </div>
            <div>
              <Lbl>Team</Lbl>
              {leagueTeams.length>0
                ?<select value={addTeam} onChange={e=>setAddTeam(e.target.value)} style={{width:"100%"}}>
                    <option value="">— Free Agent —</option>
                    {leagueTeams.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                :<input value={addTeam} onChange={e=>setAddTeam(e.target.value)} placeholder="Team name…"/>}
            </div>
            <div><Lbl>Jersey #</Lbl><input value={addJersey} onChange={e=>setAddJersey(e.target.value)} placeholder="#"/></div>
          </div>
          <Btn onClick={addPlayer} disabled={addSaving||!addName.trim()||!addPos.length}>{addSaving?"Creating…":"✅ Create Page"}</Btn>
        </Card>
      )}
      {!players.length&&!showAdd&&<Empty icon={sport==="basketball"?"🏀":isBaseball?"⚾":"🏈"} msg="No member pages yet — click Create Member Page above"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:8}}>
        {players.filter(Boolean).map((p,i)=>{
          const m=p.nova_user_id?users.find(u=>u.id===p.nova_user_id):matchMember(p.name);
          const rid=p.roblox_id||m?.social_roblox||"";
          return(
            <div key={i} onClick={()=>{const f=sport==="basketball"?"scoring_stats":isBaseball?"hitting_stats":"passing_stats";setSel(p.id);setStatField(f);setStatType("season");setStatData(p[f+"_season"]||{});}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,cursor:"pointer",transition:"all .18s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${accentColor}66`;e.currentTarget.style.background=`${accentColor}0a`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${accentColor}22`;e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
              <div style={{width:42,height:42,borderRadius:8,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {rid?<img src={`/api/roblox-avatar?userId=${rid}`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<span style={{fontSize:18}}>{sport==="basketball"?"🏀":isBaseball?"⚾":"🏈"}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:10,color:accentColor}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</span>
                  {p.ovr&&<span style={{padding:"1px 5px",borderRadius:5,background:ovrColor(p.ovr)+"20",fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,color:ovrColor(p.ovr)}}>{p.ovr}</span>}
                </div>
                {m&&<div style={{fontSize:9,color:"#475569"}}>@{m.username}</div>}
              </div>
              <span style={{color:"#334155",fontSize:14}}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function LeaguePlayersPage({players,league,accentColor,users,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[statsView,setStatsView]=useState("season");
  const isBaseball=league==="nbbl";
  const isBasketball=league==="ringrush";
  const selectedPlayer=sel?players.find(p=>p.id===sel):null;

  // Match a league player to a Nova member — prefer explicit link
  const matchMember=(player)=>{
    if(!player)return null;
    if(player.nova_user_id)return users.find(u=>u.id===player.nova_user_id)||null;
    const n=(player.name||"").toLowerCase();
    return users.find(u=>
      (u.display_name||"").toLowerCase().includes(n)||
      n.includes((u.display_name||"").toLowerCase())||
      (u.username||"").toLowerCase()===n
    )||null;
  };

  if(sel&&selectedPlayer){
    const member=matchMember(selectedPlayer);
    const robloxId=selectedPlayer.roblox_id||member?.social_roblox||"";
    const robloxAvatarUrl=robloxId?`/api/roblox-avatar?userId=${robloxId}`:"";
    const favSong=member?.page_music;
    const songTrack=Array.isArray(favSong)?favSong[0]:favSong;
    // Helper to get stats for a given base key and type (season/career)
    const getStats=(baseKey,type)=>type==="season"?selectedPlayer[baseKey+"_season"]||{}:selectedPlayer[baseKey]||{};

    // All stat definitions per sport
    const MLB_CATS=[
      {key:"hitting_stats",label:"⚾ Hitting",color:accentColor,cols:["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]},
      {key:"pitching_stats",label:"⚾ Pitching",color:"#3B82F6",cols:["G","GS","W","L","SV","IP","H","ER","BB","SO","ERA","WHIP","K9","BB9"]},
      {key:"fielding_stats",label:"🧤 Fielding",color:"#A855F7",cols:["G","GS","PO","A","E","DP","FLD%","INN"]},
    ];
    const NFL_CATS=[
      {key:"passing_stats",label:"🎯 Passing",color:accentColor,cols:["G","CMP","ATT","YDS","TD","INT","RTG"]},
      {key:"rushing_stats",label:"🏃 Rushing",color:"#EF4444",cols:["G","CAR","YDS","TD","AVG","LONG"]},
      {key:"receiving_stats",label:"📡 Receiving",color:"#8B5CF6",cols:["G","REC","YDS","TD","AVG","LONG"]},
      {key:"defensive_stats",label:"🛡 Defense",color:"#00D4FF",cols:["G","TCK","SACK","INT","FF","PD"]},
      {key:"kicking_stats",label:"⚽ Kicking",color:"#F59E0B",cols:["G","FGM","FGA","FG%","XPM","XPA","LONG"]},
    ];
    const NBA_CATS=[
      {key:"scoring_stats",label:"🏀 Scoring",color:accentColor,cols:["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]},
      {key:"rebounds_stats",label:"💪 Rebounds",color:"#F59E0B",cols:["G","OREB","DREB","REB","REB/G"]},
      {key:"playmaking_stats",label:"🎯 Playmaking",color:"#22C55E",cols:["G","AST","TOV","AST/G","AST/TOV"]},
      {key:"defense_stats",label:"🛡 Defense",color:"#3B82F6",cols:["G","STL","BLK","PF","STL/G","BLK/G"]},
    ];
    const CATS=isBasketball?NBA_CATS:isBaseball?MLB_CATS:NFL_CATS;

    const StatTable=({cat,type})=>{
      const data=getStats(cat.key,type);
      const hasData=cat.cols.some(c=>data[c]!==undefined&&data[c]!=="");
      if(!hasData)return null;
      return(
        <Card style={{padding:"12px 14px",marginBottom:8}} hover={false}>
          <div style={{fontSize:9,color:cat.color,fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginBottom:8,fontWeight:700}}>{cat.label}</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                {cat.cols.map(c=><td key={c} style={{padding:"4px 7px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,whiteSpace:"nowrap"}}>{c}</td>)}
              </tr></thead>
              <tbody><tr>
                {cat.cols.map(c=><td key={c} style={{padding:"6px 7px",textAlign:"center",color:"#E2E8F0",fontWeight:600,fontSize:12}}>{data[c]??"—"}</td>)}
              </tr></tbody>
            </table>
          </div>
        </Card>
      );
    };

    // statsView state is declared at component top level (below)
    // Check if any stats exist for given type
    const hasAnyStats=(type)=>CATS.some(cat=>{
      const d=getStats(cat.key,type);
      return cat.cols.some(c=>d[c]!==undefined&&d[c]!=="");
    });

    return(
      <div>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:5,fontFamily:"'Orbitron',sans-serif"}}>← BACK</button>

        {/* Player hero card */}
        <Card style={{padding:mob?"16px":"20px 24px",marginBottom:14}} hover={false}>
          <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{width:mob?72:90,height:mob?72:90,borderRadius:12,overflow:"hidden",background:`linear-gradient(135deg,${accentColor}22,rgba(255,255,255,.04))`,border:`2px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {robloxAvatarUrl
                ?<img src={robloxAvatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                :<div style={{fontSize:36}}>{isBasketball?"🏀":isBaseball?"⚾":"🏈"}</div>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:20,fontWeight:900,color:"#E2E8F0",marginBottom:4}}>{selectedPlayer.name}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,color:accentColor,fontWeight:700,fontFamily:"'Orbitron',sans-serif"}}>{selectedPlayer.position}</span>
                {selectedPlayer.team&&<span style={{fontSize:11,color:"#64748B"}}>· {selectedPlayer.team}</span>}
                {selectedPlayer.jersey&&<span style={{fontSize:11,color:"#475569"}}>· #{selectedPlayer.jersey}</span>}
                {selectedPlayer.ovr&&<OVRBig ovr={selectedPlayer.ovr} size={32}/>}
              </div>
              {selectedPlayer.spotify_url&&(()=>{
                const m2=selectedPlayer.spotify_url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
                const embedUrl=m2?`https://open.spotify.com/embed/${m2[1]}/${m2[2]}?utm_source=generator&theme=0`:"";
                return embedUrl?(
                  <div style={{marginTop:8,maxWidth:320}}>
                    <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em",marginBottom:4}}>🎵 WALK-UP SONG</div>
                    <iframe src={embedUrl} width="100%" height="80" frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy" style={{borderRadius:10,border:"none"}}/>
                  </div>
                ):null;
              })()}
              {!selectedPlayer.spotify_url&&songTrack?.url&&(
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,.04)",borderRadius:8,border:"1px solid rgba(255,255,255,.07)",marginTop:4,maxWidth:280}}>
                  {songTrack.thumbnail&&<img src={songTrack.thumbnail} style={{width:28,height:28,borderRadius:4,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em"}}>🎵 ANTHEM</div>
                    <div style={{fontSize:10,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{songTrack.title||"Playing…"}</div>
                  </div>
                </div>
              )}
              {member&&<button onClick={()=>navigate("profile",member.id)} style={{marginTop:8,padding:"4px 12px",borderRadius:8,background:`${accentColor}18`,border:`1px solid ${accentColor}44`,color:accentColor,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>View Nova Profile →</button>}
            </div>
          </div>
        </Card>

        {/* Stats section with Season/Career toggle */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em"}}>STATS</div>
          <div style={{display:"flex",gap:5}}>
            {[["season","📅 Season"],["career","🏆 Career"]].map(([t,l])=>(
              <button key={t} onClick={()=>setStatsView(t)}
                style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                  border:`1px solid ${statsView===t?accentColor+"66":"rgba(255,255,255,.08)"}`,
                  background:statsView===t?accentColor+"18":"rgba(255,255,255,.03)",
                  color:statsView===t?accentColor:"#475569"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {CATS.map(cat=><StatTable key={cat.key} cat={cat} type={statsView}/>)}
        {!hasAnyStats(statsView)&&(
          <div style={{textAlign:"center",padding:"30px 0",color:"#334155",fontSize:12,fontFamily:"'Orbitron',sans-serif"}}>
            No {statsView} stats recorded yet
            {statsView==="season"&&hasAnyStats("career")&&<div style={{marginTop:6,fontSize:10}}>Switch to Career to see stats</div>}
          </div>
        )}
      </div>
    );
  }

  // Player list view
  return(
    <div>
      <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:12}}>{players.length} PLAYERS</div>
      {!players.length&&<Empty icon={isBasketball?"🏀":isBaseball?"⚾":"🏈"} msg="No players yet"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {players.filter(Boolean).map((p,i)=>{
          const member=matchMember(p);
          const robloxId=p.roblox_id||member?.social_roblox||"";
          const robloxAvatarUrl=robloxId?`/api/roblox-avatar?userId=${robloxId}`:"";
          return(
            <div key={i} onClick={()=>setSel(p.id)}
              style={{background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,borderRadius:12,padding:"14px",cursor:"pointer",transition:"all .18s",display:"flex",gap:12,alignItems:"center"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor+"66";e.currentTarget.style.background=`${accentColor}0a`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${accentColor}22`;e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
              <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {robloxAvatarUrl
                  ?<img src={robloxAvatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.parentNode.innerHTML=isBaseball?"⚾":"🏈";}}/>
                  :<span style={{fontSize:20}}>{isBasketball?"🏀":isBaseball?"⚾":"🏈"}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontSize:10,color:accentColor,fontWeight:600}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</div>
                  {p.ovr&&<div style={{padding:"1px 6px",borderRadius:6,background:ovrColor(p.ovr)+"20",border:`1px solid ${ovrColor(p.ovr)}44`,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:ovrColor(p.ovr)}}>{p.ovr}</div>}
                </div>
                {p.team&&<div style={{fontSize:9,color:"#475569"}}>{p.team}</div>}
              </div>
              <span style={{color:"#334155",fontSize:12}}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[tab,setTab]=useState("members");
  const[announce,setAnnounce]=useState("");
  const[announcements,setAnnouncements]=useState([]);
  const[announceSent,setAnnounceSent]=useState(false);
  const target=sel?users.find(u=>u.id===sel):null;
  const[starTarget,setStarTarget]=useState("");
  const[starAmount,setStarAmount]=useState("");
  const[starReason,setStarReason]=useState("");
  const[starMsg,setStarMsg]=useState(null);
  const[starBalances,setStarBalances]=useState({});
  const[starLoading,setStarLoading]=useState(false);
  const isCoOwner=cu?.staff_role==="Co-owner";
  const isRRAdmin=cu?.staff_role==="Basketball League Admin";
  if(!cu?.is_owner&&!isCoOwner&&!isRRAdmin)return<div style={{padding:"100px 20px",textAlign:"center",color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>⛔ Access Denied</div>;

  const loadStarBalance=async(uid)=>{
    if(starBalances[uid]!==undefined)return;
    const rows=await sb.get("nova_stars",`?user_id=eq.${uid}&limit=1`);
    setStarBalances(p=>({...p,[uid]:rows?.[0]?.balance||0}));
  };

  const giveStars=async()=>{
    const amt=parseInt(starAmount);
    if(!starTarget||!amt||isNaN(amt)){setStarMsg({msg:"Pick a user and enter an amount","color":"#EF4444"});return;}
    setStarLoading(true);
    const rows=await sb.get("nova_stars",`?user_id=eq.${starTarget}&limit=1`);
    const reason=starReason.trim()||"Owner grant";
    if(rows?.length){
      const nb=(rows[0].balance||0)+amt;
      const nl=(rows[0].lifetime_earned||0)+(amt>0?amt:0);
      await sb.patch("nova_stars",`?user_id=eq.${starTarget}`,{balance:Math.max(0,nb),lifetime_earned:nl});
      setStarBalances(p=>({...p,[starTarget]:Math.max(0,nb)}));
    }else{
      const nb=Math.max(0,amt);
      await sb.post("nova_stars",{user_id:starTarget,balance:nb,lifetime_earned:nb>0?nb:0,last_login_claim:0,login_streak:0});
      setStarBalances(p=>({...p,[starTarget]:nb}));
    }
    await sb.post("nova_star_log",{id:gid(),user_id:starTarget,amount:amt,reason:`[OWNER] ${reason}`,ts:Date.now()});
    const u=users.find(x=>x.id===starTarget);
    setStarMsg({msg:`${amt>0?"+":" "}${amt} ⭐ ${amt>0?"given to":"taken from"} ${u?.display_name||"user"}`,color:amt>0?"#22C55E":"#EF4444"});
    setStarAmount("");setStarReason("");
    setStarLoading(false);
    setTimeout(()=>setStarMsg(null),3000);
  };
  const toggleBadge=async(uid,bid)=>{
    const u=users.find(x=>x.id===uid);if(!u)return;
    const bs=u.badges||[];const nb=bs.includes(bid)?bs.filter(b=>b!==bid):[...bs,bid];
    await sb.patch("nova_users",`?id=eq.${uid}`,{badges:nb});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,badges:nb}:x));
  };
  const setRole=async(uid,role)=>{
    await sb.patch("nova_users",`?id=eq.${uid}`,{staff_role:role||null});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,staff_role:role||null}:x));
  };
  const deleteUser=async uid=>{
    if(!confirm("Permanently delete this user? This cannot be undone."))return;
    await sb.del("nova_users",`?id=eq.${uid}`);
    setUsers(prev=>prev.filter(u=>u.id!==uid));setSel(null);
  };
  const resetAvatar=async uid=>{
    await sb.patch("nova_users",`?id=eq.${uid}`,{avatar_url:"",avatar:"👤"});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,avatar_url:"",avatar:"👤"}:x));
  };
  const sendAnnouncement=async()=>{
    if(!announce.trim())return;
    const notifs=users.filter(u=>u.id!==cu.id).map(u=>({id:gid(),to_user_id:u.id,from_user_id:cu.id,msg:`📢 ${announce}`,ts:Date.now(),read:false}));
    await Promise.all(notifs.map(n=>sb.post("nova_notifications",n)));
    setAnnouncements(prev=>[{text:announce,ts:Date.now()},...prev]);
    setAnnounce("");setAnnounceSent(true);setTimeout(()=>setAnnounceSent(false),3000);
  };
  const statsCards=[
    {label:"TOTAL MEMBERS",val:users.length,color:"#00D4FF",icon:"👥"},
    {label:"ONLINE NOW",val:users.filter(u=>u.status_type==="online").length,color:"#22C55E",icon:"🟢"},
    {label:"STAFF MEMBERS",val:users.filter(u=>u.staff_role).length,color:"#A78BFA",icon:"⭐"},
    {label:"BADGES GIVEN",val:users.reduce((a,u)=>a+(u.badges||[]).length,0),color:"#F59E0B",icon:"🏅"},
    {label:"TOTAL PREDICTIONS",val:users.reduce((a,u)=>a+Object.keys(u.predictions||{}).length,0),color:"#EF4444",icon:"🎯"},
    {label:"AVG FOLLOWERS",val:users.length?Math.round(users.reduce((a,u)=>a+(u.followers||[]).length,0)/users.length):0,color:"#34D399",icon:"📈"},
  ];
  return(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{fontSize:32}}>⚡</div>
        <div>
          <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?20:26,fontWeight:700,margin:0,background:"linear-gradient(135deg,#F59E0B,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Owner Dashboard</h1>
          <div style={{fontSize:12,color:"#475569",marginTop:2}}>Nova Command Center · Welcome back, {cu.display_name}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:12,marginBottom:28}}>
        {statsCards.map((s,i)=>(
          <Card key={i} style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:24}}>{s.icon}</div>
              <div>
                <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em"}}>{s.label}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,fontWeight:900,color:s.color}}>{s.val}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Dashboard tab groups */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {/* Nova tabs */}
        {!isRRAdmin&&<div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>NOVA</div>
          {[["members","👥 Members"],["badges","🏅 Badges"],["roles","⭐ Roles"],["stars","⭐ Stars"],["announce","📢 Announce"],["ratings","📊 Ratings"],["gm_ovr","🎮 GM OVRs"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(245,158,11,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tab===t?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>}
        {/* NFFL tabs */}
        {!isRRAdmin&&<div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>🏈 Football League</div>
          {[["nffl_feed","📢 Game Feed"],["nffl_roster","👥 Roster"],["nffl_stats","📊 Stats"],["nffl_transactions","📋 Transactions"],["nffl_members","👤 Member Pages"],["nffl_teams","🏟 Teams"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(245,158,11,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tab===t?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>}
        {/* NBBL tabs */}
        {!isRRAdmin&&<div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>⚾ Baseball League</div>
          {[["nbbl_feed","📢 Game Feed"],["nbbl_roster","👥 Roster"],["nbbl_stats","📊 Stats"],["nbbl_transactions","📋 Transactions"],["nbbl_members","👤 Member Pages"],["nbbl_teams","🏟 Teams"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(34,197,94,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(34,197,94,.12)":"rgba(255,255,255,.03)",color:tab===t?"#22C55E":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>}
        {/* Ring Rush tabs */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>🏀 Basketball League</div>
          {[["rr_feed","📢 Game Feed"],["rr_roster","👥 Roster"],["rr_stats","📊 Stats"],["rr_transactions","📋 Transactions"],["rr_members","👤 Member Pages"],["rr_teams","🏟 Teams"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(236,72,153,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(236,72,153,.12)":"rgba(255,255,255,.03)",color:tab===t?"#EC4899":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>
      {tab==="members"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":sel?"1fr 1fr":"1fr",gap:16}}>
          <div>
            <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:12,letterSpacing:".1em"}}>ALL MEMBERS ({users.length})</h2>
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:600,overflowY:"auto"}}>
              {[...users].sort((a,b)=>(b.followers||[]).length-(a.followers||[]).length).map(u=>(
                <div key={u.id} onClick={()=>setSel(u.id===sel?null:u.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:sel===u.id?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",border:`1px solid ${sel===u.id?"rgba(245,158,11,.3)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .18s"}}>
                  <Av user={u} size={36}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.display_name}</div>
                    <div style={{fontSize:11,color:"#475569"}}>@{u.username}{u.staff_role&&<span style={{color:ROLE_COLOR[u.staff_role]||"#00D4FF"}}> · {u.staff_role}</span>}</div>
                    <div style={{fontSize:10,color:"#334155"}}>{(u.followers||[]).length} followers · {(u.badges||[]).length} badges</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <StatusDot type={u.status_type||"offline"} size={10}/>
                    {u.is_owner&&<span style={{fontSize:9,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>OWNER</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {target&&(
            <div>
              <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:12,letterSpacing:".1em"}}>MANAGING: {target.display_name.toUpperCase()}</h2>
              <Card style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Av user={target} size={52}/>
                  <div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{target.display_name}</div>
                    <div style={{fontSize:12,color:"#475569"}}>@{target.username}</div>
                    <div style={{fontSize:11,color:"#334155",marginTop:2}}>Joined {target.joined} · {(target.followers||[]).length} followers</div>
                  </div>
                </div>
                <div><Lbl>Staff Role</Lbl>
                  <select value={target.staff_role||""} onChange={e=>setRole(target.id,e.target.value)} style={{width:"100%"}}>
                    <option value="">None</option>
                    {Object.keys(ROLE_COLOR).map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><Lbl>Badges</Lbl>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {BADGES.map(b=>{const has=(target.badges||[]).includes(b.id);return(
                      <button key={b.id} onClick={()=>toggleBadge(target.id,b.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${has?b.color:b.color+"33"}`,background:has?b.color+"22":"rgba(255,255,255,.03)",color:has?b.color:"#475569",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,transition:"all .15s"}}><span>{b.icon}</span>{b.label}</button>
                    );})}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <Btn variant="ghost" size="sm" onClick={()=>navigate("profile",target.id)}>👤 View Profile</Btn>
                  <Btn variant="ghost" size="sm" onClick={()=>resetAvatar(target.id)}>🗑 Reset Avatar</Btn>
                  {!target.is_owner&&<Btn variant="danger" size="sm" onClick={()=>deleteUser(target.id)}>⛔ Delete User</Btn>}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
      {tab==="badges"&&(
        <div>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".1em"}}>BADGE OVERVIEW</h2>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(2,1fr)",gap:12}}>
            {BADGES.map(b=>{
              const holders=users.filter(u=>(u.badges||[]).includes(b.id));
              return(
                <Card key={b.id} style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:b.color+"22",border:`1px solid ${b.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{b.icon}</div>
                    <div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:b.color}}>{b.label}</div>
                      <div style={{fontSize:11,color:"#475569"}}>{holders.length} member{holders.length!==1?"s":""} have this</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {holders.slice(0,8).map(u=>(
                      <div key={u.id} onClick={()=>{setTab("members");setSel(u.id);}} title={u.display_name} style={{cursor:"pointer"}}><Av user={u} size={28}/></div>
                    ))}
                    {holders.length>8&&<div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#475569"}}>+{holders.length-8}</div>}
                    {holders.length===0&&<div style={{fontSize:11,color:"#334155"}}>No members yet</div>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {tab==="roles"&&(
        <div>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".1em"}}>STAFF ROLES</h2>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(2,1fr)",gap:12,marginBottom:20}}>
            {Object.entries(ROLE_COLOR).map(([role,color])=>{
              const members=users.filter(u=>u.staff_role===role);
              return(
                <Card key={role} style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:color}}/>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color}}>{role}</div>
                    <div style={{fontSize:11,color:"#475569",marginLeft:"auto"}}>{members.length} member{members.length!==1?"s":""}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {members.map(u=>(
                      <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>
                        <Av user={u} size={26}/>
                        <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"#E2E8F0"}}>{u.display_name}</div><div style={{fontSize:10,color:"#475569"}}>@{u.username}</div></div>
                        <button onClick={()=>setRole(u.id,"")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12}} title="Remove role">✕</button>
                      </div>
                    ))}
                    {members.length===0&&<div style={{fontSize:11,color:"#334155"}}>No {role}s yet</div>}
                  </div>
                </Card>
              );
            })}
          </div>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:12,letterSpacing:".1em"}}>QUICK ASSIGN</h2>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:300,overflowY:"auto"}}>
            {users.filter(u=>!u.is_owner).map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                <Av user={u} size={30}/>
                <div style={{flex:1}}><div style={{fontSize:12,color:"#E2E8F0"}}>{u.display_name}</div></div>
                <select value={u.staff_role||""} onChange={e=>setRole(u.id,e.target.value)} style={{fontSize:11,padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",minWidth:110}}>
                  <option value="">No Role</option>
                  {Object.keys(ROLE_COLOR).map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="stars"&&(
        <div style={{maxWidth:600}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".12em"}}>⭐ STAR MANAGEMENT</div>
          <Card style={{padding:20,marginBottom:16}}>
            <Lbl>Select Member</Lbl>
            <select value={starTarget} onChange={e=>{setStarTarget(e.target.value);if(e.target.value)loadStarBalance(e.target.value);}} style={{width:"100%",marginBottom:14}}>
              <option value="">— Pick a member —</option>
              {[...users].sort((a,b)=>a.display_name.localeCompare(b.display_name)).map(u=>(
                <option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>
              ))}
            </select>
            {starTarget&&(
              <div style={{fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",marginBottom:14}}>
                Current balance: {starBalances[starTarget]!==undefined?`${starBalances[starTarget].toLocaleString()} ⭐`:"loading..."}
              </div>
            )}
            <Lbl>Amount (use negative to remove stars)</Lbl>
            <input type="number" value={starAmount} onChange={e=>setStarAmount(e.target.value)} placeholder="e.g. 500 or -100" style={{marginBottom:12}}/>
            <Lbl>Reason (optional)</Lbl>
            <input value={starReason} onChange={e=>setStarReason(e.target.value)} placeholder="e.g. Community event prize" style={{marginBottom:16}}/>
            {starMsg&&<div style={{padding:"10px 14px",borderRadius:8,background:starMsg.color+"18",border:`1px solid ${starMsg.color}44`,color:starMsg.color,fontSize:12,fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:12}}>{starMsg.msg}</div>}
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={giveStars} disabled={starLoading||!starTarget||!starAmount} style={{flex:1}}>{starLoading?"Working...":"⭐ Apply Stars"}</Btn>
              <Btn variant="ghost" onClick={async()=>{
                const allRows=await sb.get("nova_stars","?order=balance.desc&limit=20");
                const updated={};
                (allRows||[]).forEach(r=>{updated[r.user_id]=r.balance||0;});
                setStarBalances(p=>({...p,...updated}));
              }}>Refresh All</Btn>
            </div>
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",letterSpacing:".12em",marginBottom:12}}>TOP STAR BALANCES</div>
            {Object.entries(starBalances).length===0&&<div style={{fontSize:11,color:"#334155"}}>Click "Refresh All" to load balances</div>}
            {Object.entries(starBalances).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([uid,bal])=>{
              const u=users.find(x=>x.id===uid);if(!u)return null;
              return(
                <div key={uid} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)",cursor:"pointer"}} onClick={()=>{setStarTarget(uid);setTab("stars");}}>
                  <Av user={u} size={28}/>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif"}}>{u.display_name}</div></div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#F59E0B"}}>{bal.toLocaleString()} ⭐</div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
      {tab==="announce"&&(
        <div style={{maxWidth:600}}>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".1em"}}>SEND ANNOUNCEMENT</h2>
          <Card style={{padding:20,marginBottom:20}}>
            <Lbl>Message (sent as notification to all members)</Lbl>
            <textarea value={announce} onChange={e=>setAnnounce(e.target.value)} placeholder="Type your announcement..." style={{resize:"vertical",minHeight:100,width:"100%",marginBottom:12,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Btn onClick={sendAnnouncement} disabled={!announce.trim()}>📢 Send to All</Btn>
              {announceSent&&<span style={{fontSize:12,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>✓ Sent!</span>}
            </div>
          </Card>
          {announcements.length>0&&(
            <div>
              <h3 style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#475569",marginBottom:10,letterSpacing:".1em"}}>RECENT ANNOUNCEMENTS</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {announcements.map((a,i)=>(
                  <Card key={i} style={{padding:"12px 16px"}}>
                    <div style={{fontSize:13,color:"#E2E8F0",marginBottom:4}}>{a.text}</div>
                    <div style={{fontSize:10,color:"#334155"}}>{fmtAgo(a.ts)}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* NFFL flat tabs */}
      {tab==="gm_ovr"&&<DashGMOvrTab cu={cu}/>}
      {tab==="ratings"&&<DashRatingsTab league="nffl" accentColor="#F59E0B" label="Football League"/>}
      {tab==="ratings"&&<DashRatingsTab league="nbbl" accentColor="#22C55E" label="Baseball League"/>}
      {tab==="ratings"&&<DashRatingsTab league="ringrush" accentColor="#EC4899" label="Basketball League"/>}
      {!isRRAdmin&&tab==="nffl_feed"&&<DashLeagueFeed league="nffl" accentColor="#F59E0B" cu={cu}/>}
      {!isRRAdmin&&tab==="nffl_roster"&&<DashLeagueRoster league="nffl" accentColor="#F59E0B" cu={cu}/>}
      {tab==="nffl_stats"&&<DashLeagueStats league="nffl" accentColor="#F59E0B" isBaseball={false}/>}
      {tab==="nffl_transactions"&&<DashLeagueTx league="nffl" accentColor="#F59E0B"/>}
      {tab==="nffl_members"&&<DashLeagueMembers league="nffl" accentColor="#F59E0B" users={users} isBaseball={false}/>}
      {/* NBBL flat tabs */}
      {tab==="nbbl_feed"&&<DashLeagueFeed league="nbbl" accentColor="#22C55E" cu={cu}/>}
      {tab==="nbbl_roster"&&<DashLeagueRoster league="nbbl" accentColor="#22C55E" cu={cu}/>}
      {tab==="nbbl_stats"&&<DashLeagueStats league="nbbl" accentColor="#22C55E" isBaseball={true}/>}
      {tab==="nbbl_transactions"&&<DashLeagueTx league="nbbl" accentColor="#22C55E"/>}
      {tab==="nbbl_members"&&<DashLeagueMembers league="nbbl" accentColor="#22C55E" users={users} isBaseball={true}/>}
      {/* Ring Rush */}
      {tab==="nffl_teams"&&<DashLeagueTeams league="nffl" accentColor="#F59E0B"/>}
      {tab==="nbbl_teams"&&<DashLeagueTeams league="nbbl" accentColor="#22C55E"/>}
      {tab==="rr_feed"&&<DashLeagueFeed league="ringrush" accentColor="#EC4899" cu={cu}/>}
      {tab==="rr_roster"&&<DashLeagueRoster league="ringrush" accentColor="#EC4899" cu={cu} sport="basketball"/>}
      {tab==="rr_stats"&&<DashLeagueStats league="ringrush" accentColor="#EC4899" isBaseball={false} sport="basketball"/>}
      {tab==="rr_transactions"&&<DashLeagueTx league="ringrush" accentColor="#EC4899"/>}
      {tab==="rr_members"&&<DashLeagueMembers league="ringrush" accentColor="#EC4899" users={users} isBaseball={false} sport="basketball"/>}
      {tab==="rr_teams"&&<DashLeagueTeams league="ringrush" accentColor="#EC4899"/>}
    </div>
  );
}

// ─── News Page ────────────────────────────────────────────────────────────────
// Uses ESPN news API + GNews RSS — no Twitter/Nitter dependency
const ESPN_NEWS_SOURCES=[
  {id:"mlb",  url:"https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news?limit=20",     label:"MLB News",      sport:"⚾", color:"#002D72"},
  {id:"nfl",  url:"https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=20",     label:"NFL News",      sport:"🏈", color:"#013369"},
  {id:"nba",  url:"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=20",   label:"NBA News",      sport:"🏀", color:"#C9082A"},
  {id:"nhl",  url:"https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news?limit=20",       label:"NHL News",      sport:"🏒", color:"#0033A0"},
];

// Source label overrides for known ESPN reporters/sections
const REPORTER_TAGS={"Jeff Passan":"⚾","Adam Schefter":"🏈","Dianna Russini":"🏈","Mel Kiper":"🏈","Buster Olney":"⚾","Tim Kurkjian":"⚾"};

const TEAM_KEYWORDS={
  "Yankees":["Yankees","NYY"],"Red Sox":["Red Sox","BOS"],"Mets":["Mets","NYM"],
  "Dodgers":["Dodgers","LAD"],"Cubs":["Cubs","CHC"],"Cardinals":["Cardinals","STL"],
  "Braves":["Braves","ATL"],"Astros":["Astros","HOU"],"Giants":["Giants","SFG","SF Giants"],
  "Padres":["Padres","SD Padres"],"Phillies":["Phillies","PHI"],"Brewers":["Brewers","MIL"],
  "Rays":["Rays","Tampa Bay Rays"],"Blue Jays":["Blue Jays","TOR"],"Orioles":["Orioles","BAL"],
  "White Sox":["White Sox","CWS"],"Royals":["Royals","Kansas City Royals"],"Twins":["Twins","Minnesota Twins"],
  "Guardians":["Guardians","Cleveland Guardians"],"Tigers":["Tigers","Detroit Tigers"],
  "Mariners":["Mariners","Seattle Mariners"],"Angels":["Angels","LA Angels"],"Athletics":["Athletics","Oakland A's"],
  "Rangers":["Rangers","Texas Rangers"],"Rockies":["Rockies","Colorado Rockies"],
  "Marlins":["Marlins","Miami Marlins"],"Nationals":["Nationals","Washington Nationals"],
  "Pirates":["Pirates","Pittsburgh Pirates"],"Reds":["Reds","Cincinnati Reds"],
  "Diamondbacks":["Diamondbacks","Arizona D-backs"],
  "Chiefs":["Chiefs","Kansas City Chiefs"],"Eagles":["Eagles","Philadelphia Eagles"],
  "Cowboys":["Cowboys","Dallas Cowboys"],"49ers":["49ers","San Francisco 49ers"],
  "Bills":["Bills","Buffalo Bills"],"Dolphins":["Dolphins","Miami Dolphins"],
  "Patriots":["Patriots","New England Patriots"],"Jets":["Jets","New York Jets"],
  "Ravens":["Ravens","Baltimore Ravens"],"Steelers":["Steelers","Pittsburgh Steelers"],
  "Browns":["Browns","Cleveland Browns"],"Bengals":["Bengals","Cincinnati Bengals"],
  "Texans":["Texans","Houston Texans"],"Colts":["Colts","Indianapolis Colts"],
  "Jaguars":["Jaguars","Jacksonville Jaguars"],"Titans":["Titans","Tennessee Titans"],
  "Broncos":["Broncos","Denver Broncos"],"Raiders":["Raiders","Las Vegas Raiders"],
  "Chargers":["Chargers","LA Chargers"],"Seahawks":["Seahawks","Seattle Seahawks"],
  "Rams":["Rams","LA Rams"],"Packers":["Packers","Green Bay Packers"],
  "Bears":["Bears","Chicago Bears"],"Lions":["Lions","Detroit Lions"],
  "Vikings":["Vikings","Minnesota Vikings"],"Saints":["Saints","New Orleans Saints"],
  "Falcons":["Falcons","Atlanta Falcons"],"Panthers":["Panthers","Carolina Panthers"],
  "Buccaneers":["Buccaneers","Tampa Bay Bucs"],"Commanders":["Commanders","Washington Commanders"],
  "Giants (NFL)":["NY Giants","New York Giants"],"Cardinals (NFL)":["Arizona Cardinals"],
  "Lakers":["Lakers","Los Angeles Lakers"],"Celtics":["Celtics","Boston Celtics"],
};

function detectTeams(text){
  if(!text)return[];
  const found=[];
  for(const[team,kws] of Object.entries(TEAM_KEYWORDS)){
    if(kws.some(kw=>new RegExp(`\\b${kw.replace(/[()]/g,"\\$&")}\\b`,"i").test(text))&&!found.includes(team))found.push(team);
  }
  return found.slice(0,4);
}

async function fetchESPNNews(){
  const all=[];
  await Promise.allSettled(ESPN_NEWS_SOURCES.map(async src=>{
    try{
      const d=await(await fetch(src.url)).json();
      (d.articles||[]).forEach(a=>{
        const headline=a.headline||a.title||"";
        const desc=a.description||a.summary||"";
        const fullText=headline+" "+desc;
        const imgUrl=a.images?.[0]?.url||null;
        const reporter=a.byline||null;
        const link=a.links?.web?.href||a.links?.api?.news?.href||"https://espn.com";
        const pubDate=a.published?new Date(a.published).getTime():Date.now();
        all.push({
          id:`espn_${src.id}_${a.id||a.dataSourceIdentifier||Math.random()}`,
          source:src,
          reporter,
          headline,
          desc,
          imgUrl,
          link,
          pubDate,
          teams:detectTeams(fullText),
          categories:(a.categories||[]).map(c=>c.description||c.type).filter(Boolean).slice(0,2),
        });
      });
    }catch{}
  }));
  // Dedup by headline similarity and sort newest first
  const seen=new Set();
  return all.filter(x=>{if(seen.has(x.headline))return false;seen.add(x.headline);return true;})
            .sort((a,b)=>b.pubDate-a.pubDate);
}

function NewsPage({cu,users,addNotif,navOpts={}}){
  const mob=useIsMobile();
  const[feed,setFeed]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState("all");
  const[expandedId,setExpandedId]=useState(navOpts.expandId||null);
  const expandedRef=useRef(null);
  useEffect(()=>{
    if(navOpts.expandId){
      setExpandedId(navOpts.expandId);
      loadNewsComments(navOpts.expandId);
      setTimeout(()=>expandedRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),600);
    }
  },[navOpts.expandId]);
  const[comments,setComments]=useState({});
  const[commentTexts,setCommentTexts]=useState({});
  const notifiedRef=useRef(new Set());

  const loadFeed=async(quiet=false)=>{
    if(!quiet)setLoading(true);
    const items=await fetchESPNNews();
    setFeed(items);
    if(!quiet)setLoading(false);
    if(cu&&items.length){
      // Map user's team IDs (like "nfl_kc") to team name strings (like "Chiefs") for matching
      const allTeams=[...MLB_TEAMS,...NFL_TEAMS,...NBA_TEAMS,...NHL_TEAMS];
      const cuTeamNames=[cu.mlb_team,cu.nfl_team,cu.nba_team,cu.nhl_team]
        .filter(Boolean)
        .map(id=>allTeams.find(t=>t.id===id))
        .filter(Boolean)
        .flatMap(t=>[t.name.toLowerCase(),t.abbr.toLowerCase()]);
      items.forEach(item=>{
        if(notifiedRef.current.has(item.id))return;
        const match=item.teams.some(t=>cuTeamNames.some(cn=>cn===t.toLowerCase()||t.toLowerCase().includes(cn)||cn.includes(t.toLowerCase())));
        if(match){
          addNotif&&addNotif(cu.id,cu.id,`📰 ${item.headline.slice(0,80)}`,{type:"news",url:item.link});
          notifiedRef.current.add(item.id);
        }
      });
    }
  };

  useEffect(()=>{loadFeed();},[]);
  useEffect(()=>{const t=setInterval(()=>loadFeed(true),90000);return()=>clearInterval(t);},[]);

  // Load persisted comments for a news item when expanded
  const loadNewsComments=async(itemId)=>{
    if(comments[itemId])return;
    const rows=await sb.get("nova_comments",`?profile_user_id=eq.news_${itemId}&order=timestamp.desc`);
    setComments(prev=>({...prev,[itemId]:rows||[]}));
  };

  const toggleExpand=(itemId)=>{
    if(expandedId===itemId){setExpandedId(null);}
    else{setExpandedId(itemId);loadNewsComments(itemId);}
  };

  const postComment=async(itemId,imgUrl="")=>{
    const text=commentTexts[itemId]||"";
    if(!text.trim()&&!imgUrl||!cu)return;
    const msg=imgUrl?`__IMG__${imgUrl}`:text.trim();
    const c={id:gid(),profile_user_id:`news_${itemId}`,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text:msg,timestamp:Date.now(),likes:[]};
    await sb.post("nova_comments",c);
    setComments(prev=>({...prev,[itemId]:[c,...(prev[itemId]||[])]}));
    setCommentTexts(prev=>({...prev,[itemId]:""}));
  };

  const[teamFilter,setTeamFilter]=useState("");
  // Build grouped team list from all 4 sports, alphabetically per sport, only teams in current feed
  const feedTeamSet=new Set(feed.flatMap(x=>x.teams));
  const groupedTeams=[
    {label:"⚾ MLB", teams:MLB_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏈 NFL", teams:NFL_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏀 NBA", teams:NBA_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏒 NHL", teams:NHL_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
  ].filter(g=>g.teams.length>0);
  const displayed=(()=>{
    let items=filter==="all"?feed:feed.filter(x=>x.source.id===filter);
    if(teamFilter)items=items.filter(x=>x.teams.includes(teamFilter));
    return items;
  })();

  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"44px 16px 80px"}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?20:24,fontWeight:700,margin:"0 0 4px",background:"linear-gradient(135deg,#00D4FF,#8B5CF6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📰 Sports News</h1>
        <div style={{fontSize:12,color:"#475569"}}>Powered by ESPN · updates every 90s</div>
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
        {[["all","🌐 All"],["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${filter===id?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:filter===id?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:filter===id?"#00D4FF":"#64748B",transition:"all .2s"}}>{label}</button>
        ))}
        <button onClick={()=>loadFeed()} style={{marginLeft:"auto",padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.03)",color:"#475569"}}>↻ Refresh</button>
      </div>

      {/* Team filter dropdown */}
      {groupedTeams.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:11,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em",flexShrink:0}}>🏷 TEAM:</span>
          <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)} style={{flex:1,maxWidth:240,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"6px 10px",color:teamFilter?"#00D4FF":"#64748B",fontSize:12,cursor:"pointer"}}>
            <option value="">All Teams</option>
            {groupedTeams.map(g=>(
              <optgroup key={g.label} label={g.label}>
                {g.teams.map(t=><option key={t} value={t} style={{background:"#0F172A"}}>{t}</option>)}
              </optgroup>
            ))}
          </select>
          {teamFilter&&<button onClick={()=>setTeamFilter("")} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,color:"#EF4444"}}>✕ Clear</button>}
        </div>
      )}

      {loading&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}>
          <div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:12}}>⚙️</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>FETCHING LATEST NEWS...</div>
        </div>
      )}

      {!loading&&displayed.length===0&&(
        <Empty icon="📡" msg="No news found. Try refreshing."/>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {displayed.map(item=>{
          const isExp=expandedId===item.id;
          const itemComments=comments[item.id]||[];
          const cmtText=commentTexts[item.id]||"";
          return(
            <Card key={item.id} ref={isExp?expandedRef:null} style={{padding:"14px 16px"}} hover={false}>
              {/* Source + timestamp */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:item.source.color+"33",border:`1px solid ${item.source.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{item.source.sport}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:item.source.color,letterSpacing:".08em"}}>{item.source.label}{item.reporter&&<span style={{color:"#475569",fontWeight:400}}> · {item.reporter}</span>}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{fmtAgo(item.pubDate)}</div>
                </div>
                <a href={item.link} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#334155",textDecoration:"none",flexShrink:0,padding:"4px 6px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}} title="Read on ESPN">↗</a>
              </div>

              {/* Image */}
              {item.imgUrl&&<img src={item.imgUrl} style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:10,marginBottom:10,display:"block"}} loading="lazy"/>}

              {/* Headline */}
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:700,color:"#E2E8F0",lineHeight:1.5,marginBottom:item.desc?6:0}}>{item.headline}</div>

              {/* Description */}
              {item.desc&&<div style={{fontSize:13,color:"#64748B",lineHeight:1.6,marginBottom:8}}>{item.desc.slice(0,200)}{item.desc.length>200?"…":""}</div>}

              {/* Team + category tags */}
              {(item.teams.length>0||item.categories.length>0)&&(
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  {item.teams.map(t=>(
                    <span key={t} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(0,212,255,.1)",border:"1px solid rgba(0,212,255,.25)",color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{t}</span>
                  ))}
                  {item.categories.slice(0,2).map(c=>(
                    <span key={c} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#475569"}}>{c}</span>
                  ))}
                </div>
              )}

              {/* Comment toggle */}
              <button onClick={()=>toggleExpand(item.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#475569",display:"flex",alignItems:"center",gap:5,padding:"4px 0",marginTop:2}}>
                💬 {itemComments.length>0?`${itemComments.length} comment${itemComments.length!==1?"s":""}`:cu?"Discuss":"Comments"}
                <span style={{fontSize:10,color:"#334155"}}>{isExp?"▲":"▼"}</span>
              </button>

              {/* Expanded discussion */}
              {isExp&&(
                <div style={{marginTop:10,borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:10}}>
                  {cu&&(
                    <div style={{marginBottom:12}}>
                      <div style={{display:"flex",gap:8,marginBottom:6}}>
                        <Av user={cu} size={28}/>
                        <input value={cmtText} onChange={e=>setCommentTexts(prev=>({...prev,[item.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();postComment(item.id);}}} placeholder="Discuss this story..." style={{flex:1,fontSize:13}}/>
                        <Btn size="sm" onClick={()=>postComment(item.id)} disabled={!cmtText.trim()}>Post</Btn>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <CommentImgUpload onUpload={async f=>{
                          const ext=f.name.split(".").pop();
                          const url=await sbUp("nova-banners",`news-${gid()}.${ext}`,f);
                          if(url)postComment(item.id,url);
                        }}/>
                        <button onClick={()=>setNewsGifPicker(item.id)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#A78BFA",fontSize:12,fontWeight:700}}>GIF</button>
                      </div>
                      {newsGifPicker===item.id&&<GifPicker onSelect={url=>postComment(item.id,`__IMG__${url}`)} onClose={()=>setNewsGifPicker(null)}/>}
                    </div>
                  )}
                  {!cu&&<div style={{fontSize:12,color:"#475569",marginBottom:10,padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:8}}>Sign in to join the discussion</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {itemComments.length===0&&<div style={{fontSize:11,color:"#334155",textAlign:"center",padding:"8px 0"}}>No comments yet — be first!</div>}
                    {itemComments.map(c=>{
                      const isImg=c.text?.startsWith("__IMG__");
                      return(
                        <div key={c.id} style={{display:"flex",gap:8,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>
                          <AvatarCircle user={{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#00D4FF"}} size={26}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0"}}>{c.author_name}</span>
                              <span style={{fontSize:10,color:"#334155"}}>{fmtAgo(c.timestamp)}</span>
                            </div>
                            {isImg
                              ?<img src={c.text.slice(7)} style={{maxWidth:200,maxHeight:160,borderRadius:8,display:"block",objectFit:"contain",cursor:"pointer"}} onClick={()=>window.open(c.text.slice(7),"_blank")}/>
                              :<div style={{fontSize:12,color:"#94A3B8",lineHeight:1.5,wordBreak:"break-word"}}>{c.text}</div>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Auth Modals ───────────────────────────────────────────────────────────────
function LoginModal({onLogin,onClose,users}){
  const[un,setUn]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const go=async()=>{
    setLoading(true);setErr("");
    const u=users.find(x=>x.username.toLowerCase()===un.toLowerCase()&&x.password===pw);
    if(u){saveSess(u);onLogin(u);}else setErr("Wrong username or password");
    setLoading(false);
  };
  return(
    <Modal title="🚀 Sign In" onClose={onClose} width={400}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><Lbl>Username</Lbl><input value={un} onChange={e=>setUn(e.target.value)} placeholder="username"/></div>
        <div><Lbl>Password</Lbl><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="password"/></div>
        {err&&<div style={{color:"#EF4444",fontSize:13}}>{err}</div>}
        <Btn onClick={go} disabled={loading}>{loading?"Signing in...":"Sign In"}</Btn>
      </div>
    </Modal>
  );
}
function RegisterModal({onRegister,onClose}){
  const[un,setUn]=useState("");const[pw,setPw]=useState("");const[dn,setDn]=useState("");const[av,setAv]=useState("🌟");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const go=async()=>{
    if(!un||!pw||!dn){setErr("All fields required");return;}
    if(un.length<3){setErr("Username must be 3+ characters");return;}
    if(pw.length<6){setErr("Password must be 6+ characters");return;}
    setLoading(true);setErr("");
    const exists=await sb.get("nova_users",`?username=eq.${un}`);
    if(exists&&exists.length>0){setErr("Username taken");setLoading(false);return;}
    const newUser={id:gid(),username:un,password:pw,display_name:dn,avatar:av,bio:"",is_owner:false,staff_role:null,joined:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),badges:[],status_type:"online",status_activity:"",followers:[],following:[],page_accent:"#00D4FF",page_music:{},page_clips:[],page_social:[],page_social_links:{},banner_top_url:"",banner_left_url:"",banner_right_url:"",social_roblox:"",social_instagram:"",social_twitter:"",social_youtube:"",social_discord:"",mlb_team:"",nfl_team:"",nba_team:"",nhl_team:"",dob:"",predictions:{},correct_predictions:0,avatar_url:""};
    const res=await sb.post("nova_users",newUser);
    if(res){const u=Array.isArray(res)?res[0]:res;saveSess(u);onRegister(u);}else setErr("Registration failed. Try again.");
    setLoading(false);
  };
  return(
    <Modal title="✨ Join Nova" onClose={onClose} width={400}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><Lbl>Display Name</Lbl><input value={dn} onChange={e=>setDn(e.target.value)} placeholder="Your name"/></div>
        <div><Lbl>Username</Lbl><input value={un} onChange={e=>setUn(e.target.value)} placeholder="no spaces"/></div>
        <div><Lbl>Password</Lbl><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="6+ characters"/></div>
        <div><Lbl>Avatar Emoji</Lbl><input value={av} onChange={e=>setAv(e.target.value)} placeholder="🚀"/></div>
        {err&&<div style={{color:"#EF4444",fontSize:13}}>{err}</div>}
        <Btn onClick={go} disabled={loading}>{loading?"Creating account...":"Create Account"}</Btn>
      </div>
    </Modal>
  );
}

// ─── MatchupPage.jsx ──────────────────────────────────────────────────────────
// Batter vs. Pitcher simulation using pre-computed Statcast tendencies.
// Add this component to App.jsx and render it on page "matchup".
//
// Wiring (in App.jsx):
//   (MatchupPage is defined inline below)
//   OR paste this entire file directly into App.jsx before the closing `}`
//
// In App content() function, add:
//   if(page==="matchup") return <MatchupPage />;
//
// In the nav/sidebar, add a link:
//   <button onClick={()=>nav("matchup")}>⚔️ Matchup Sim</button>
//   <button onClick={()=>nav("animecards")}>🌸 Anime Cards</button>

// ─── Simulation engine (pure JS, no dependencies) ─────────────────────────────


// ─── Batter vs Pitcher Matchup Simulator v2 ───────────────────────────────────
// Uses MLB Stats API (2025 + 2026 season) via /api/hyperbeam proxy
// No CSV needed — fetches real stats on demand, caches per player

const SIM_CACHE = {};
const PLAYER_STAT_CACHE = {};

// ── Statcast helpers ──────────────────────────────────────────────────────────
function searchStatcastPlayers(q, type) {
  const lq = q.toLowerCase();
  return STATCAST_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(lq) &&
    (type === "any" || !type || p.type === type)
  ).slice(0, 8).map(p => ({ id: p.id, name: p.name, team: p.type === "pitcher" ? "P" : "", type: p.type }));
}

function getStatcastProfile(playerId) {
  const bProf = STATCAST_TENDENCIES.batters?.[playerId];
  if (bProf) return { ...bProf, _source: "statcast" };
  const pProf = STATCAST_TENDENCIES.pitchers?.[playerId];
  if (pProf) return { ...pProf, _source: "statcast" };
  return null;
}

const PITCH_LABELS = {
  "FF":"4-Seam FB","FA":"Fastball","FT":"2-Seam FB","SI":"Sinker","FC":"Cutter",
  "SL":"Slider","CU":"Curveball","KC":"Knuckle Curve","CH":"Changeup",
  "FS":"Splitter","KN":"Knuckleball","UN":"Unknown","SW":"Sweeper","ST":"Sweeper",
};
const OUTCOME_LABELS = {
  "1B":"Single","2B":"Double","3B":"Triple","HR":"Home Run","BB":"Walk",
  "HBP":"Hit By Pitch","K":"Strikeout","OUT":"Out","GIDP":"Double Play",
};
const DEFAULT_OUTCOMES = {
  "1B":0.150,"2B":0.045,"3B":0.005,"HR":0.030,"BB":0.085,
  "K":0.220,"OUT":0.420,"HBP":0.010,"GIDP":0.025,"SF":0.007,
};
const OUTCOME_COLORS = {
  "HR":"#A855F7","3B":"#EC4899","2B":"#F59E0B","1B":"#22C55E",
  "BB":"#3B82F6","HBP":"#06B6D4","K":"#EF4444","OUT":"#475569","GIDP":"#374151",
};

function wRandom(weights){
  const keys=Object.keys(weights);
  const vals=keys.map(k=>weights[k]);
  const total=vals.reduce((a,b)=>a+b,0);
  if(total===0)return keys[Math.floor(Math.random()*keys.length)];
  let r=Math.random()*total;
  for(let i=0;i<keys.length;i++){r-=vals[i];if(r<=0)return keys[i];}
  return keys[keys.length-1];
}

function buildProfileFromStats(s,type){
  const avg=parseFloat(s.avg||s.battingAverage||0.250);
  const obp=parseFloat(s.obp||s.onBasePercentage||0.320);
  const slg=parseFloat(s.slg||s.sluggingPercentage||0.420);
  const kpct=s.strikeOuts&&s.plateAppearances?parseInt(s.strikeOuts)/parseInt(s.plateAppearances):0.22;
  const bbpct=s.baseOnBalls&&s.plateAppearances?parseInt(s.baseOnBalls)/parseInt(s.plateAppearances):0.085;
  const hr=s.homeRuns&&s.plateAppearances?parseInt(s.homeRuns)/parseInt(s.plateAppearances):0.030;
  const hits=s.hits&&s.atBats?parseInt(s.hits)/parseInt(s.atBats):avg;
  const doubles=s.doubles&&s.atBats?parseInt(s.doubles)/parseInt(s.atBats):hits*0.20;
  const triples=s.triples&&s.atBats?parseInt(s.triples)/parseInt(s.atBats):hits*0.03;
  const singles=Math.max(0,hits-doubles-triples-hr);
  const out=Math.max(0,1-kpct-bbpct-singles-doubles-triples-hr-0.01);
  const pMix={"FF":0.35,"SL":0.22,"CH":0.18,"FC":0.12,"CU":0.08,"SI":0.05};
  return{
    overall:{avg,obp,slg,k_pct:kpct,bb_pct:bbpct,hard_hit:slg>0.45?0.48:0.38},
    pitch_mix:pMix,
    vs_pitch:Object.fromEntries(Object.keys(pMix).map(pt=>{
      const fb=pt==="FF"||pt==="SI"||pt==="FC";
      const bk=pt==="SL"||pt==="CU";
      const bonus=(fb?(slg>0.50?0.06:-0.03):0)+(bk?(kpct<0.18?-0.04:0.05):0);
      const aAvg=Math.max(0.100,Math.min(0.400,avg+bonus));
      const aSlg=Math.max(0.150,Math.min(0.750,slg+bonus*1.8));
      const aK=Math.max(0.05,Math.min(0.55,kpct+(bk?0.06:-0.03)));
      const aBB=Math.max(0.02,bbpct);
      const h=aAvg;const d2=aSlg*0.20;const d3=aSlg*0.02;const ehr=aSlg*0.08;
      const s1=Math.max(0,h-d2-d3-ehr);const ot=Math.max(0,1-aK-aBB-s1-d2-d3-ehr-0.01);
      return[pt,{pct:pMix[pt],sample:200,avg:+aAvg.toFixed(3),obp:+(aAvg+aBB+0.01).toFixed(3),
        slg:+aSlg.toFixed(3),k_pct:+aK.toFixed(3),bb_pct:+aBB.toFixed(3),hard_hit:slg>0.45?0.48:0.35,
        outcomes:{"1B":+s1.toFixed(4),"2B":+d2.toFixed(4),"3B":+d3.toFixed(4),"HR":+ehr.toFixed(4),
          "BB":+aBB.toFixed(4),"K":+aK.toFixed(4),"OUT":+Math.max(0,ot).toFixed(4),"HBP":0.01,"GIDP":0.015}}];
    })),
  };
}

async function fetchPlayerStats(playerId,season){
  const key=`${playerId}_${season}`;
  if(PLAYER_STAT_CACHE[key])return PLAYER_STAT_CACHE[key];
  try{
    const url=encodeURIComponent(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=hitting,pitching&season=${season}&sportId=1`);
    const r=await fetch(`/api/hyperbeam?espn_proxy=1&url=${url}`);
    if(r.ok){
      const d=await r.json();
      const stats=(d?.stats||[]).flatMap(g=>g.splits||[]).find(s=>s.stat)?.stat||null;
      if(stats){PLAYER_STAT_CACHE[key]=stats;return stats;}
    }
  }catch(e){}
  return null;
}

async function buildMatchupProfiles(batterId,pitcherId){
  const[b26,b25,p26,p25]=await Promise.all([
    fetchPlayerStats(batterId,2026),fetchPlayerStats(batterId,2025),
    fetchPlayerStats(pitcherId,2026),fetchPlayerStats(pitcherId,2025),
  ]);
  const merge=(s26,s25)=>{
    if(!s25&&!s26)return[null,"N/A"];
    if(!s25)return[s26,"2026"];
    if(!s26)return[s25,"2025"];
    const pa26=parseInt(s26.plateAppearances||0);
    if(pa26>=80)return[s26,"2026"];
    if(pa26>0){
      const w=pa26/(pa26+parseInt(s25.plateAppearances||100));
      const bl=(a,b)=>+(parseFloat(a||0)*w+parseFloat(b||0)*(1-w)).toFixed(3);
      return[{...s25,...s26,avg:bl(s26.avg,s25.avg).toString(),obp:bl(s26.obp,s25.obp).toString(),slg:bl(s26.slg,s25.slg).toString(),_blended:true},"2025+2026"];
    }
    return[s25,"2025"];
  };
  const[bS,bSn]=merge(b26,b25);
  const[pS,pSn]=merge(p26,p25);
  return{
    batter:buildProfileFromStats(bS||{},"batter"),
    pitcher:buildProfileFromStats(pS||{},"pitcher"),
    bSeasons:bSn,pSeasons:pSn,bRaw:bS,pRaw:pS,
  };
}

function blendOutcomes(b,p,bw=0.6){
  const keys=new Set([...Object.keys(b||{}),...Object.keys(p||{}),...Object.keys(DEFAULT_OUTCOMES)]);
  const bl={};
  for(const k of keys)bl[k]=(b?.[k]??DEFAULT_OUTCOMES[k]??0)*bw+(p?.[k]??DEFAULT_OUTCOMES[k]??0)*(1-bw)+(DEFAULT_OUTCOMES[k]??0)*0.05;
  const t=Object.values(bl).reduce((a,c)=>a+c,0);
  for(const k of Object.keys(bl))bl[k]/=t;
  return bl;
}

function runSimulation(bProf,pProf,nSims=1000){
  const outC={};const pitchC={};const seqLog={};
  const pMix=pProf.pitch_mix||{"FF":1};let prev=null;
  for(let i=0;i<nSims;i++){
    const pt=wRandom(pMix);pitchC[pt]=(pitchC[pt]||0)+1;
    if(prev){const s=`${prev}→${pt}`;seqLog[s]=(seqLog[s]||0)+1;}prev=pt;
    const ev=wRandom(blendOutcomes(bProf.vs_pitch?.[pt]?.outcomes||null,pProf.vs_pitch?.[pt]?.outcomes||null));
    outC[ev]=(outC[ev]||0)+1;
  }
  const H=(outC["1B"]||0)+(outC["2B"]||0)+(outC["3B"]||0)+(outC["HR"]||0);
  const W=(outC["BB"]||0)+(outC["HBP"]||0);
  const AB=nSims-W-(outC["SF"]||0)-(outC["SB"]||0);
  const TB=(outC["1B"]||0)+2*(outC["2B"]||0)+3*(outC["3B"]||0)+4*(outC["HR"]||0);
  const avg=AB>0?H/AB:0,obp=nSims>0?(H+W)/nSims:0,slg=AB>0?TB/AB:0;
  const bo=bProf.overall||{};
  const insights=[];
  const vsp=bProf.vs_pitch||{};
  const pts=Object.entries(vsp).filter(([,d])=>d.sample>=20).map(([pt,d])=>({pt,label:PITCH_LABELS[pt]||pt,...d}));
  if(pts.length>=2){
    const bySlg=[...pts].sort((a,b)=>(b.slg||0)-(a.slg||0));
    if(bySlg[0]?.slg>=0.45)insights.push(`Crushes ${bySlg[0].label}s (.${Math.round((bySlg[0].slg||0)*1000)} SLG)`);
    if(bySlg[bySlg.length-1]?.slg<=0.30)insights.push(`Struggles vs ${bySlg[bySlg.length-1].label}s (.${Math.round((bySlg[bySlg.length-1].slg||0)*1000)} SLG)`);
    const byK=[...pts].sort((a,b)=>(b.k_pct||0)-(a.k_pct||0));
    if(byK[0]?.k_pct>=0.30)insights.push(`High K rate vs ${byK[0].label}s (${Math.round((byK[0].k_pct||0)*100)}%)`);
  }
  if((bo.hard_hit||0)>=0.44)insights.push(`Hard contact machine — ${Math.round((bo.hard_hit||0)*100)}% hard hit rate`);
  if((bo.k_pct||0)>=0.28)insights.push(`Strikeout risk (${Math.round((bo.k_pct||0)*100)}% K rate)`);
  if((bo.bb_pct||0)>=0.12)insights.push(`Patient — ${Math.round((bo.bb_pct||0)*100)}% walk rate`);
  if(insights.length===0)insights.push("Simulation built from 2025+2026 season stats.");
  return{
    stats:{avg:+avg.toFixed(3),obp:+obp.toFixed(3),slg:+slg.toFixed(3),ops:+(obp+slg).toFixed(3),kPct:+(outC["K"]||0)/nSims,bbPct:W/nSims,hrPct:+(outC["HR"]||0)/nSims},
    outcomes:Object.entries(outC).sort((a,b)=>b[1]-a[1]).map(([ev,n])=>({ev,label:OUTCOME_LABELS[ev]||ev,n,pct:n/nSims})),
    pitchUsage:Object.entries(pitchC).sort((a,b)=>b[1]-a[1]).map(([pt,n])=>({pt,label:PITCH_LABELS[pt]||pt,pct:n/nSims})),
    sequences:Object.entries(seqLog).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([s,n])=>{const[p1,p2]=s.split("→");return{label:`${PITCH_LABELS[p1]||p1} → ${PITCH_LABELS[p2]||p2}`,pct:n/nSims};}),
    insights,nSims,
  };
}

function MatchupPage(){
  const mob=useIsMobile();
  const[bSearch,setBSearch]=useState("");
  const[pSearch,setPSearch]=useState("");
  const[bResults,setBResults]=useState([]);
  const[pResults,setPResults]=useState([]);
  const[selBatter,setSelBatter]=useState(null);
  const[selPitcher,setSelPitcher]=useState(null);
  const[simResult,setSimResult]=useState(null);
  const[loading,setLoading]=useState(false);
  const[loadMsg,setLoadMsg]=useState("");
  const[nSims,setNSims]=useState(1000);
  const[showBDD,setShowBDD]=useState(false);
  const[showPDD,setShowPDD]=useState(false);
  const[bStats,setBStats]=useState(null);
  const[pStats,setPStats]=useState(null);
  const[dataSeasons,setDataSeasons]=useState({b:"",p:""});
  const AC="#F59E0B";
  const searchPlayers=(q,setter,showDD,type)=>{
    if(q.length<2){setter([]);return;}
    const results=searchStatcastPlayers(q,type||"any");
    setter(results);
    if(results.length>0)showDD(true);
  };
  const scol=(k,v)=>{
    if(k==="avg")return v>=0.280?"#22C55E":v>=0.240?"#F59E0B":"#EF4444";
    if(k==="obp")return v>=0.350?"#22C55E":v>=0.310?"#F59E0B":"#EF4444";
    if(k==="slg")return v>=0.450?"#22C55E":v>=0.380?"#F59E0B":"#EF4444";
    if(k==="ops")return v>=0.800?"#22C55E":v>=0.700?"#F59E0B":"#EF4444";
    if(k==="kPct")return v<=0.18?"#22C55E":v<=0.25?"#F59E0B":"#EF4444";
    if(k==="bbPct")return v>=0.10?"#22C55E":v>=0.07?"#F59E0B":"#64748B";
    return"#94A3B8";
  };
  const fmtS=(k,v)=>{
    if(["kPct","bbPct","hrPct"].includes(k))return`${(v*100).toFixed(1)}%`;
    if(["avg","obp","slg"].includes(k)){const s=v.toFixed(3);return s.startsWith("0")?s.slice(1):s;}
    return v.toFixed(3);
  };
  const inp={width:"100%",padding:"9px 13px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"#E2E8F0",fontSize:13,outline:"none"};
  const runSim=async()=>{
    if(!selBatter||!selPitcher)return;
    const ck=`${selBatter.id}|${selPitcher.id}|${nSims}`;
    if(SIM_CACHE[ck]){setSimResult(SIM_CACHE[ck]);return;}
    setLoading(true);setLoadMsg("Loading Statcast tendencies…");
    try{
      // Try statcast profiles first
      const bStatcast=getStatcastProfile(selBatter.id);
      const pStatcast=getStatcastProfile(selPitcher.id);
      let batter,pitcher,bSeasons="Statcast",pSeasons="Statcast",bRaw=null,pRaw=null;
      if(bStatcast&&pStatcast){
        batter=bStatcast;pitcher=pStatcast;
      } else {
        setLoadMsg("Fetching 2025 & 2026 stats…");
        const profiles=await buildMatchupProfiles(selBatter.id,selPitcher.id);
        batter=bStatcast||profiles.batter;
        pitcher=pStatcast||profiles.pitcher;
        bSeasons=bStatcast?"Statcast":profiles.bSeasons;
        pSeasons=pStatcast?"Statcast":profiles.pSeasons;
        bRaw=profiles.bRaw;pRaw=profiles.pRaw;
      }
      setBStats(bRaw);setPStats(pRaw);setDataSeasons({b:bSeasons,p:pSeasons});
      setLoadMsg("Running simulations…");
      await new Promise(r=>setTimeout(r,16));
      const result=runSimulation(batter,pitcher,nSims);
      SIM_CACHE[ck]=result;setSimResult(result);
    }catch(e){console.error(e);}
    setLoading(false);setLoadMsg("");
  };
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mob?"10px 10px 100px":"20px 20px 80px"}}>
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(3,7,18,.88)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><div style={{fontSize:36}}>⚾</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",fontSize:13}}>{loadMsg}</div></div>}
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:24,fontWeight:900,color:"#E2E8F0",marginBottom:4}}>⚔️ BATTER vs PITCHER</div>
        <div style={{fontSize:11,color:"#475569"}}>Monte Carlo simulation · Real MLB 2025 + 2026 stats</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14,marginBottom:14}}>
        <div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:5}}>BATTER</div>
          <div style={{position:"relative"}}>
            <input style={inp} placeholder="Search batter…" value={bSearch}
              onChange={e=>{setBSearch(e.target.value);searchPlayers(e.target.value,setBResults,setShowBDD,"batter");setSelBatter(null);setSimResult(null);}}
              onFocus={()=>bResults.length>0&&setShowBDD(true)}
              onBlur={()=>setTimeout(()=>setShowBDD(false),150)}/>
            {selBatter&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",width:7,height:7,borderRadius:"50%",background:"#22C55E"}}/>}
            {showBDD&&bResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,background:"#0F172A",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,.6)"}}>
              {bResults.map(p=><div key={p.id} onMouseDown={()=>{setSelBatter(p);setBSearch(p.name);setShowBDD(false);setBResults([]);}}
                style={{padding:"9px 14px",cursor:"pointer",fontSize:12,color:"#CBD5E1",borderBottom:"1px solid rgba(255,255,255,.04)"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,.08)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {p.name}<span style={{fontSize:10,color:"#334155",marginLeft:6}}>{p.team||""}</span></div>)}
            </div>}
          </div>
          {selBatter&&bStats&&<div style={{marginTop:5,padding:"5px 9px",borderRadius:7,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",fontSize:10}}>
            <span style={{color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:8}}>{dataSeasons.b} · </span>
            {[["AVG",bStats.avg||"—"],["OBP",bStats.obp||"—"],["SLG",bStats.slg||"—"],["HR",bStats.homeRuns||"—"]].map(([l,v])=><span key={l} style={{marginRight:8}}><span style={{color:"#475569",fontSize:9}}>{l} </span><span style={{color:AC,fontWeight:700}}>{v}</span></span>)}
          </div>}
        </div>
        <div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:5}}>PITCHER</div>
          <div style={{position:"relative"}}>
            <input style={inp} placeholder="Search pitcher…" value={pSearch}
              onChange={e=>{setPSearch(e.target.value);searchPlayers(e.target.value,setPResults,setShowPDD,"pitcher");setSelPitcher(null);setSimResult(null);}}
              onFocus={()=>pResults.length>0&&setShowPDD(true)}
              onBlur={()=>setTimeout(()=>setShowPDD(false),150)}/>
            {selPitcher&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",width:7,height:7,borderRadius:"50%",background:"#22C55E"}}/>}
            {showPDD&&pResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,background:"#0F172A",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,.6)"}}>
              {pResults.map(p=><div key={p.id} onMouseDown={()=>{setSelPitcher(p);setPSearch(p.name);setShowPDD(false);setPResults([]);}}
                style={{padding:"9px 14px",cursor:"pointer",fontSize:12,color:"#CBD5E1",borderBottom:"1px solid rgba(255,255,255,.04)"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,.08)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {p.name}<span style={{fontSize:10,color:"#334155",marginLeft:6}}>{p.team||""}</span></div>)}
            </div>}
          </div>
          {selPitcher&&pStats&&<div style={{marginTop:5,padding:"5px 9px",borderRadius:7,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",fontSize:10}}>
            <span style={{color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:8}}>{dataSeasons.p} · </span>
            {[["ERA",pStats.era||"—"],["K",pStats.strikeOuts||"—"],["BB",pStats.baseOnBalls||"—"],["WHIP",pStats.whip||"—"]].map(([l,v])=><span key={l} style={{marginRight:8}}><span style={{color:"#475569",fontSize:9}}>{l} </span><span style={{color:AC,fontWeight:700}}>{v}</span></span>)}
          </div>}
        </div>
      </div>
      <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>SIMS:</div>
        {[500,1000,5000,10000].map(n=><button key={n} onClick={()=>{setNSims(n);setSimResult(null);}}
          style={{padding:"4px 11px",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
            border:`1px solid ${nSims===n?AC+"66":"rgba(255,255,255,.08)"}`,background:nSims===n?AC+"14":"rgba(255,255,255,.02)",color:nSims===n?AC:"#475569"}}>{n.toLocaleString()}</button>)}
        <button onClick={runSim} disabled={!selBatter||!selPitcher||loading}
          style={{marginLeft:"auto",padding:"10px 22px",borderRadius:12,border:"none",cursor:!selBatter||!selPitcher?"not-allowed":"pointer",
            fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,color:"#fff",
            background:!selBatter||!selPitcher?"rgba(255,255,255,.06)":`linear-gradient(135deg,${AC},${AC}cc)`,
            opacity:!selBatter||!selPitcher?0.4:1}}>
          {loading?"Running…":"▶ SIMULATE"}
        </button>
      </div>
      {selBatter&&selPitcher&&<div style={{textAlign:"center",padding:"7px 0",marginBottom:12,fontSize:mob?13:16,fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:"#E2E8F0"}}>
        {selBatter.name} <span style={{color:"#334155",fontWeight:400,fontSize:11}}>vs</span> {selPitcher.name}
      </div>}
      {simResult&&<SimResultsBlock result={simResult} scol={scol} fmtS={fmtS} ac={AC} dataSeasons={dataSeasons} mob={mob}/>}
    </div>
  );
}

function SimResultsBlock({result,scol,fmtS,ac,dataSeasons,mob}){
  const maxPct=result.outcomes[0]?.pct||1;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(4,1fr)":"repeat(7,1fr)",gap:7,marginBottom:14}}>
        {[["avg","AVG"],["obp","OBP"],["slg","SLG"],["ops","OPS"],["kPct","K%"],["bbPct","BB%"],["hrPct","HR%"]].map(([k,l])=>(
          <div key={k} style={{textAlign:"center",padding:"9px 5px",borderRadius:11,background:"rgba(255,255,255,.04)",border:`1px solid ${scol(k,result.stats[k])}33`}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:"#475569",marginBottom:3}}>{l}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?14:18,fontWeight:900,color:scol(k,result.stats[k])}}>{fmtS(k,result.stats[k])}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",marginBottom:12}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",marginBottom:9}}>OUTCOME DISTRIBUTION</div>
        {result.outcomes.slice(0,8).map(({ev,label,pct})=>(
          <div key={ev} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <div style={{width:mob?52:70,fontSize:10,color:OUTCOME_COLORS[ev]||"#64748B",fontFamily:"'Orbitron',sans-serif",fontWeight:700,textAlign:"right",flexShrink:0}}>{label}</div>
            <div style={{flex:1,background:"rgba(255,255,255,.05)",borderRadius:4,height:15,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,borderRadius:4,background:(OUTCOME_COLORS[ev]||"#64748B")+"bb",width:`${(pct/maxPct)*100}%`,transition:"width .5s"}}/>
              <div style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontWeight:700,zIndex:1}}>{(pct*100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>
        <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",marginBottom:9}}>PITCH USAGE</div>
          {result.pitchUsage.slice(0,6).map(({pt,label,pct})=>(
            <div key={pt} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{width:75,fontSize:10,color:"#94A3B8",flexShrink:0}}>{label}</div>
              <div style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:3,height:10}}>
                <div style={{height:"100%",borderRadius:3,background:ac+"99",width:`${pct*100}%`,transition:"width .4s"}}/>
              </div>
              <div style={{fontSize:9,color:"#64748B",width:30,textAlign:"right",fontFamily:"'Orbitron',sans-serif"}}>{(pct*100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",marginBottom:9}}>PITCH SEQUENCES</div>
          {result.sequences.map(({label,pct},i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
              <span style={{fontSize:10,color:"#94A3B8"}}>{label}</span>
              <span style={{fontSize:10,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{(pct*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.18)"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#A855F7",marginBottom:8}}>🔍 MATCHUP INSIGHTS</div>
        {result.insights.map((t,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:5}}><span style={{color:"#A855F7",flexShrink:0}}>•</span><span style={{fontSize:12,color:"#CBD5E1",lineHeight:1.5}}>{t}</span></div>)}
        <div style={{marginTop:7,fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{result.nSims.toLocaleString()} simulated PAs · Data: {dataSeasons.b||"2025"} batter / {dataSeasons.p||"2025"} pitcher</div>
      </div>
    </div>
  );
}


// ─── AnimeCardGame.jsx ────────────────────────────────────────────────────────
// Full anime card collecting + battle game
// Add to App.jsx and render on page "animecards"

// ── Card Data ─────────────────────────────────────────────────────────────────
const ANIME_CHARACTERS = [
  // [id, name, series, type, atk, def, hp, ability, abilityDesc, rarity, element]
  // ICONIC (1%)
  ["gc01","Goku (Ultra Instinct)","Dragon Ball","Fighter",98,88,200,"Ultra Instinct","Dodge all attacks this turn with 70% chance","Iconic","Fire"],
  ["gc02","Naruto (Baryon Mode)","Naruto","Fighter",97,82,195,"Baryon Burn","Deal 3x damage, lose 15HP after","Iconic","Wind"],
  ["gc03","Saitama","One Punch Man","Fighter",99,70,180,"One Punch","Instantly KO any enemy under 50% HP","Iconic","Lightning"],
  ["gc04","Monkey D. Luffy (Gear 5)","One Piece","Fighter",96,85,200,"Nika Awakening","Double all damage for 2 turns","Iconic","Lightning"],
  ["gc05","Itachi Uchiha","Naruto","Mage",90,80,175,"Tsukuyomi","Skip opponent's next turn, deal 40 damage","Iconic","Shadow"],
  // MYSTIC (3%)
  ["mc01","Vegeta (Super Saiyan Blue)","Dragon Ball","Fighter",92,84,185,"Final Flash","Charge turn, then deal 80 damage","Mystic","Fire"],
  ["mc02","Sasuke Uchiha (Rinnegan)","Naruto","Mage",91,78,175,"Amenotejikara","Switch places with opponent, deal 35 damage","Mystic","Shadow"],
  ["mc03","Levi Ackermann","Attack on Titan","Fighter",88,75,165,"Thunder Slash","Hit 4 times rapidly, 20 damage each","Mystic","Wind"],
  ["mc04","Killua Zoldyck","HxH","Fighter",87,72,160,"Godspeed","Gain +40 speed, auto-dodge next attack","Mystic","Lightning"],
  ["mc05","Erza Scarlet","Fairy Tail","Fighter",89,86,178,"Heaven's Wheel","Deal 60 damage, gain 20 armor","Mystic","Holy"],
  ["mc06","Gojo Satoru","Jujutsu Kaisen","Mage",95,90,185,"Infinity","Block all damage for 1 turn","Mystic","Holy"],
  ["mc07","Ryomen Sukuna","Jujutsu Kaisen","Demon",94,75,180,"Malevolent Shrine","Deal 70 damage to all enemies","Mystic","Shadow"],
  ["mc08","Zoro (Enma)","One Piece","Fighter",90,82,175,"Three Sword Style","Three hits for 25 damage each","Mystic","Wind"],
  ["mc09","Alucard","Hellsing","Demon",92,80,200,"Cromwell Initiation","Drain 30 HP from enemy, heal self","Mystic","Shadow"],
  ["mc10","Madara Uchiha","Naruto","Mage",93,85,185,"Perfect Susanoo","Deal 65 damage, block 30 next turn","Mystic","Shadow"],
  // LEGENDARY (7%)
  ["lc01","Edward Elric","Fullmetal Alchemist","Mage",82,70,155,"Transmutation","Transform terrain, deal 45 damage","Legendary","Earth"],
  ["lc02","Hisoka Morow","HxH","Fighter",85,68,158,"Bungee Gum","Bind enemy for 1 turn, deal 35 damage","Legendary","Shadow"],
  ["lc03","Kakashi Hatake","Naruto","Mage",80,75,160,"Kamui","Remove enemy buff AND deal 30 damage","Legendary","Lightning"],
  ["lc04","Roronoa Zoro","One Piece","Fighter",84,78,165,"Ittoryu","Single devastating hit for 55 damage","Legendary","Wind"],
  ["lc05","Gon Freecss","HxH","Fighter",83,65,162,"Jajanken Rock","Deal 50 damage, chance to stun","Legendary","Earth"],
  ["lc06","Meruem","HxH","Demon",88,80,172,"Photon","Steal 25% of enemy's attack stat","Legendary","Shadow"],
  ["lc07","Ken Kaneki","Tokyo Ghoul","Demon",82,70,168,"Kakuja","Go berserk: +30 ATK, -20 DEF for 3 turns","Legendary","Shadow"],
  ["lc08","Tanjiro Kamado","Demon Slayer","Fighter",80,72,158,"Hinokami Kagura","Sun breathing: 45 damage + burn","Legendary","Fire"],
  ["lc09","Ichigo Kurosaki","Bleach","Fighter",86,74,170,"Bankai","Massively boost ATK for 2 turns","Legendary","Lightning"],
  ["lc10","Mikasa Ackermann","Attack on Titan","Fighter",81,74,160,"Ackermann Clan","Counter-attack: reflect 50% damage","Legendary","Wind"],
  ["lc11","Rimuru Tempest","That Time I Got Reincarnated","Mage",84,76,165,"Predator","Copy enemy's ability for this battle","Legendary","Water"],
  ["lc12","Sung Jin-Woo","Solo Leveling","Fighter",87,78,172,"Shadow Army","Summon shadow minion, deal 40 damage","Legendary","Shadow"],
  ["lc13","Ban","Seven Deadly Sins","Fighter",83,72,165,"Snatch","Steal 20 STR from enemy permanently","Legendary","Earth"],
  ["lc14","Escanor","Seven Deadly Sins","Fighter",86,75,168,"The One","At noon: untouchable, deal 60 damage","Legendary","Fire"],
  ["lc15","Ainz Ooal Gown","Overlord","Mage",85,80,170,"Grasp Heart","50% chance to instant KO","Legendary","Shadow"],
  // EPIC (14%)
  ["ec01","Mob","Mob Psycho 100","Mage",78,65,150,"100%","Unleash psychic power: 40 damage","Epic","Holy"],
  ["ec02","Shoto Todoroki","My Hero Academia","Fighter",76,70,152,"Half Cold Half Hot","Choose: freeze or burn enemy (30 dmg each)","Epic","Fire"],
  ["ec03","Bakugo Katsuki","My Hero Academia","Fighter",80,62,148,"Howitzer Impact","Explosive blast: 45 damage","Epic","Fire"],
  ["ec04","All Might","My Hero Academia","Fighter",82,68,158,"United States of Smash","Massive blow: 50 damage, may stun","Epic","Lightning"],
  ["ec05","Natsu Dragneel","Fairy Tail","Fighter",79,64,152,"Fire Dragon King Mode","Triple fire damage for 1 turn","Epic","Fire"],
  ["ec06","Lucy Heartfilia","Fairy Tail","Mage",72,68,145,"Celestial Spirits","Summon 3 spirits, 15 damage each","Epic","Holy"],
  ["ec07","Nobara Kugisaki","Jujutsu Kaisen","Mage",74,70,148,"Resonance","Link to enemy doll: deal 35 shared damage","Epic","Earth"],
  ["ec08","Yuji Itadori","Jujutsu Kaisen","Fighter",78,72,155,"Divergent Fist","Delay burst punch: 40 damage","Epic","Lightning"],
  ["ec09","Muzan Kibutsuji","Demon Slayer","Demon",80,72,160,"Absorption","Heal 25HP and boost ATK","Epic","Shadow"],
  ["ec10","Akaza","Demon Slayer","Demon",78,68,155,"Destructive Death","Spinning assault: 35 damage","Epic","Wind"],
  ["ec11","Shinobu Kocho","Demon Slayer","Mage",70,66,140,"Insect Breathing","Poison enemy: 8 damage per turn for 4 turns","Epic","Wind"],
  ["ec12","Giyu Tomioka","Demon Slayer","Fighter",76,75,155,"Water Breathing","Flowing counter: reflect 40% incoming damage","Epic","Water"],
  ["ec13","Spike Spiegel","Cowboy Bebop","Fighter",74,65,148,"See You Space Cowboy","Dual guns: 2x25 damage","Epic","Wind"],
  ["ec14","Reigen Arataka","Mob Psycho 100","Fighter",65,60,140,"100% Shot","Borrow Mob's power: 35 damage once","Epic","Holy"],
  ["ec15","Light Yagami","Death Note","Mage",72,68,145,"Death Note","Skip enemy turn with 60% success rate","Epic","Shadow"],
  ["ec16","L Lawliet","Death Note","Mage",70,70,145,"Deduction","Reveal enemy hand, steal their buff","Epic","Holy"],
  ["ec17","Accelerator","A Certain Magical Index","Mage",82,78,162,"Vector Control","Reflect all projectile attacks back","Epic","Lightning"],
  ["ec18","Kaguya Otsutsuki","Naruto","Mage",80,78,165,"All-Killing Ash Bones","Hit ignores all defense","Epic","Shadow"],
  ["ec19","Dio Brando","JoJo","Demon",79,72,158,"ZA WARUDO","Stop time: deal 45 damage uncontested","Epic","Shadow"],
  ["ec20","Jotaro Kujo","JoJo","Fighter",78,74,158,"ORA ORA ORA","11 hit combo: 8 damage per hit","Epic","Lightning"],
  // RARE (22%)
  ["rc01","Deku (Full Cowl)","My Hero Academia","Fighter",72,65,142,"One For All 100%","Smash for 35 damage, recoil 10","Rare","Lightning"],
  ["rc02","Inosuke Hashibira","Demon Slayer","Fighter",70,60,138,"Beast Breathing","Wild slashes: 28 damage","Rare","Wind"],
  ["rc03","Zenitsu Agatsuma","Demon Slayer","Fighter",68,58,136,"Thunderclap Flash","Lightning speed: 32 damage","Rare","Lightning"],
  ["rc04","Shanks","One Piece","Fighter",75,70,150,"Haki Burst","Intimidate: lower enemy ATK by 20","Rare","Wind"],
  ["rc05","Nami","One Piece","Mage",65,62,132,"Clima-Tact","Weather manipulation: 22 damage","Rare","Lightning"],
  ["rc06","Sanji","One Piece","Fighter",73,65,145,"Hell Memories","Flaming kick: 30 damage","Rare","Fire"],
  ["rc07","Brook","One Piece","Mage",68,60,138,"Soul King","Soul music: paralyze enemy 1 turn","Rare","Shadow"],
  ["rc08","Rin Okumura","Blue Exorcist","Fighter",72,64,142,"Blue Flame","Demonic fire: 28 damage + burn","Rare","Fire"],
  ["rc09","Maka Albarn","Soul Eater","Fighter",70,65,140,"Soul Wavelength","Resonance: 30 damage","Rare","Holy"],
  ["rc10","Death the Kid","Soul Eater","Fighter",71,66,141,"Death Cannon","Dual pistols: 2x18 damage","Rare","Shadow"],
  ["rc11","Yor Forger","Spy x Family","Fighter",72,64,140,"Thorn Princess","Hidden blades: 28 damage","Rare","Wind"],
  ["rc12","Loid Forger","Spy x Family","Fighter",70,68,140,"Wise Agent","Tactical strike: 25 damage + stun","Rare","Shadow"],
  ["rc13","Anya Forger","Spy x Family","Mage",55,55,120,"Telepath","Read mind: copy enemy ability once","Rare","Holy"],
  ["rc14","Gintoki Sakata","Gintama","Fighter",73,66,145,"Silver Soul","Lazy slash: 28 damage, chance to crit","Rare","Wind"],
  ["rc15","Taiga Aisaka","Toradora","Fighter",60,55,125,"Palmtop Tiger","Rage mode: +30 ATK when below 40% HP","Rare","Fire"],
  ["rc16","Yato","Noragami","Fighter",71,65,140,"Borderline","Divine slice: 30 damage","Rare","Holy"],
  ["rc17","Ryuko Matoi","Kill la Kill","Fighter",74,67,145,"Scissor Blade","Life fiber: 32 damage","Rare","Fire"],
  ["rc18","Simon","Gurren Lagann","Fighter",75,68,148,"Giga Drill","Spiral power: 35 damage","Rare","Earth"],
  ["rc19","Lelouch vi Britannia","Code Geass","Mage",68,65,138,"Geass","Force enemy to obey: skip their turn","Rare","Shadow"],
  ["rc20","Usagi Tsukino","Sailor Moon","Mage",67,63,135,"Moon Prism Power","Healing + 25 damage beam","Rare","Holy"],
  // UNCOMMON (25%)
  ["uc01","Toga Himiko","My Hero Academia","Demon",62,55,128,"Transform","Mimic: copy appearance and gain 20 HP","Uncommon","Shadow"],
  ["uc02","Denki Kaminari","My Hero Academia","Mage",63,55,128,"Electrification","Shock: 22 damage, may paralyze","Uncommon","Lightning"],
  ["uc03","Momo Yaoyorozu","My Hero Academia","Mage",64,62,130,"Creation","Create shield: block 20 damage","Uncommon","Earth"],
  ["uc04","Ochaco Uraraka","My Hero Academia","Mage",60,58,126,"Zero Gravity","Float enemy, reduce their DEF by 25","Uncommon","Wind"],
  ["uc05","Connie Springer","Attack on Titan","Fighter",60,58,126,"ODM Gear","Swift aerial: 20 damage","Uncommon","Wind"],
  ["uc06","Jean Kirstein","Attack on Titan","Fighter",62,60,130,"Tactical Mind","Team boost: +15 ATK to all cards","Uncommon","Wind"],
  ["uc07","Armin Arlert","Mage",65,60,128,"Colossal Titan","Giant transformation: 30 damage AOE","Uncommon","Earth"],
  ["uc08","Historia Reiss","Attack on Titan","Healer",55,58,125,"Ymir's Blood","Heal 30 HP, restore shield","Uncommon","Holy"],
  ["uc09","Yuno","Black Clover","Mage",65,60,130,"Spirit of Zephyr","Wind magic: 25 damage","Uncommon","Wind"],
  ["uc10","Noelle Silva","Black Clover","Mage",63,62,128,"Valkyrie Armor","Magic armor: block 25 + counter 15","Uncommon","Water"],
  ["uc11","Asta","Black Clover","Fighter",66,62,132,"Anti-Magic Sword","Null all buffs, deal 28 damage","Uncommon","Earth"],
  ["uc12","Yami Sukehiro","Black Clover","Fighter",70,65,138,"Dark Cloaked Dimension Slash","Shadow slice: 30 damage","Uncommon","Shadow"],
  ["uc13","Osamu Dazai","Bungo Stray Dogs","Mage",62,60,130,"No Longer Human","Nullify ability for 2 turns","Uncommon","Shadow"],
  ["uc14","Chuuya Nakahara","Bungo Stray Dogs","Fighter",66,62,132,"Corruption","Gravity manipulation: 30 damage","Uncommon","Earth"],
  ["uc15","Hange Zoe","Attack on Titan","Mage",63,60,128,"Research Frenzy","Titan knowledge: analyze + boost","Uncommon","Earth"],
  // COMMON (28%)
  ["cc01","Usopp","One Piece","Fighter",55,50,115,"Kabuto Slingshot","Snipe: 18 damage from distance","Common","Wind"],
  ["cc02","Chopper","One Piece","Healer",50,55,120,"Rumble Ball","Heal 20 HP, multiple forms","Common","Earth"],
  ["cc03","Robin","One Piece","Mage",58,55,120,"Cien Fleur","Bloom arms: 18 damage","Common","Earth"],
  ["cc04","Franky","One Piece","Fighter",60,58,125,"Coup de Vent","Cannon blast: 22 damage","Common","Earth"],
  ["cc05","Mineta Minoru","My Hero Academia","Mage",45,50,110,"Pop Off","Sticky balls: immobilize 1 turn","Common","Earth"],
  ["cc06","Iida Tenya","My Hero Academia","Fighter",60,58,125,"Recipro Burst","Speed dash: 20 damage","Common","Lightning"],
  ["cc07","Kirishima Eijiro","My Hero Academia","Fighter",62,68,135,"Unbreakable","Harden: take 50% less damage for 1 turn","Common","Earth"],
  ["cc08","Froppy","My Hero Academia","Fighter",55,55,122,"Frog Quirk","Tongue grab: 16 damage + stun","Common","Water"],
  ["cc09","Inuyasha","Inuyasha","Fighter",64,60,130,"Wind Scar","Wave attack: 25 damage","Common","Wind"],
  ["cc10","Kagome Higurashi","Inuyasha","Mage",58,55,120,"Sacred Arrow","Purify: 22 damage vs demons","Common","Holy"],
  ["cc11","Mirko","My Hero Academia","Fighter",66,62,132,"Luna Tijeras","Scissor kick: 26 damage","Common","Lightning"],
  ["cc12","Hawks","My Hero Academia","Fighter",65,60,130,"Fierce Wings","Feather assault: 24 damage","Common","Wind"],
  ["cc13","Hanta Sero","My Hero Academia","Fighter",55,56,118,"Tape Whip","Restrain: 16 damage + reduce enemy speed","Common","Earth"],
  ["cc14","Fumikage Tokoyami","My Hero Academia","Mage",62,60,128,"Dark Shadow","Shadow beast: 24 damage","Common","Shadow"],
  ["cc15","Mina Ashido","My Hero Academia","Mage",58,54,120,"Acid Man","Acid splash: 20 damage + melt armor","Common","Earth"],
];

const RARITY_ORDER = ["Iconic","Mystic","Legendary","Epic","Rare","Uncommon","Common"];
const RARITY_COLORS = {
  Iconic:"#F0E130",Mystic:"#E040FB",Legendary:"#FF6D00",
  Epic:"#AA00FF",Rare:"#2979FF",Uncommon:"#00C853",Common:"#546E7A"
};
const RARITY_RATES = {Iconic:0.01,Mystic:0.03,Legendary:0.07,Epic:0.14,Rare:0.22,Uncommon:0.25,Common:0.28};
const ELEMENT_COLORS = {
  Fire:"#EF5350",Water:"#42A5F5",Wind:"#66BB6A",Lightning:"#FFD600",
  Shadow:"#7B1FA2",Holy:"#FFF176",Earth:"#8D6E63"
};
const ELEMENT_EMOJI = {Fire:"🔥",Water:"💧",Wind:"🌊",Lightning:"⚡",Shadow:"🌑",Holy:"✨",Earth:"🌍"};
const TYPE_COLORS = {Fighter:"#EF4444",Mage:"#7C3AED",Demon:"#1F2937",Healer:"#059669"};

// Pack types
const PACK_TYPES = [
  {id:"standard",name:"Standard Pack",cost:100,cards:5,rates:{Iconic:0.01,Mystic:0.03,Legendary:0.07,Epic:0.14,Rare:0.22,Uncommon:0.25,Common:0.28},color:"#475569",desc:"5 cards, standard rates"},
  {id:"premium",name:"Premium Pack",cost:300,cards:5,rates:{Iconic:0.03,Mystic:0.08,Legendary:0.15,Epic:0.22,Rare:0.25,Uncommon:0.18,Common:0.09},color:"#7C3AED",desc:"5 cards, boosted rare rates"},
  {id:"legendary",name:"Legend Pack",cost:800,cards:5,rates:{Iconic:0.08,Mystic:0.15,Legendary:0.25,Epic:0.28,Rare:0.16,Uncommon:0.06,Common:0.02},color:"#F59E0B",desc:"5 cards — guaranteed Legendary+"},
  {id:"single",name:"Single Pull",cost:50,cards:1,rates:{Iconic:0.01,Mystic:0.03,Legendary:0.07,Epic:0.14,Rare:0.22,Uncommon:0.25,Common:0.28},color:"#64748B",desc:"1 card pull"},
];

// ── Anime Save Helpers ─────────────────────────────────────────────────────────
const ANIME_SAVE_KEY = "nova_anime_cards";
function loadAnimeState(){
  try{const r=localStorage.getItem(ANIME_SAVE_KEY);return r?JSON.parse(r):null;}catch{return null;}
}
function saveAnimeState(s){
  try{localStorage.setItem(ANIME_SAVE_KEY,JSON.stringify(s));}catch(e){}
}
function freshAnimeState(){
  return {coins:500,collection:[],deck:[],battleHistory:[],totalPulls:0,wins:0,losses:0};
}

// ── Card lookup helpers ────────────────────────────────────────────────────────
const CHAR_MAP = Object.fromEntries(ANIME_CHARACTERS.map(c=>([c[0],{id:c[0],name:c[1],series:c[2],type:c[3],atk:c[4],def:c[5],hp:c[6],ability:c[7],abilityDesc:c[8],rarity:c[9],element:c[10]}])));
function getCard(id){return CHAR_MAP[id]||null;}

function pullCard(rates){
  const r=Math.random();let cum=0;
  for(const [rar,rate] of Object.entries(rates)){
    cum+=rate;
    if(r<cum){
      const pool=ANIME_CHARACTERS.filter(c=>c[9]===rar);
      if(pool.length===0)continue;
      const c=pool[Math.floor(Math.random()*pool.length)];
      return{...getCard(c[0]),instanceId:`${c[0]}_${Date.now()}_${Math.random().toString(36).slice(2)}`};
    }
  }
  const fallback=ANIME_CHARACTERS[Math.floor(Math.random()*ANIME_CHARACTERS.length)];
  return{...getCard(fallback[0]),instanceId:`${fallback[0]}_${Date.now()}`};
}

// ── AI Opponent Deck ──────────────────────────────────────────────────────────
function buildAIDeck(){
  const deck=[];
  const rarityPool=["Legendary","Epic","Rare","Uncommon","Common","Epic","Rare","Uncommon"];
  while(deck.length<5){
    const rar=rarityPool[Math.floor(Math.random()*rarityPool.length)];
    const pool=ANIME_CHARACTERS.filter(c=>c[9]===rar);
    if(!pool.length)continue;
    const c=pool[Math.floor(Math.random()*pool.length)];
    deck.push({...getCard(c[0]),instanceId:`ai_${c[0]}_${Math.random().toString(36).slice(2)}`});
  }
  return deck;
}

// ── Battle Engine ─────────────────────────────────────────────────────────────
function applyAbility(caster, target, log){
  const ab=caster.ability;
  let dmg=0,heal=0,skipTurn=false,block=0,dotDmg=0,dotTurns=0;
  if(ab==="Ultra Instinct"){if(Math.random()<0.7){log.push("🌀 Dodge!");return{dmgToTarget:0,healCaster:0,skipTarget:false,block:0};}else dmg=Math.round(caster.atk*0.9);}
  else if(ab==="Baryon Burn"){dmg=Math.round(caster.atk*3.0);heal=-15;}
  else if(ab==="One Punch"){dmg=target.currentHp<target.hp*0.5?target.currentHp:Math.round(caster.atk*1.2);}
  else if(ab==="Nika Awakening"){dmg=Math.round(caster.atk*2.0);caster._powered=2;}
  else if(ab==="Tsukuyomi"){skipTurn=true;dmg=40;}
  else if(ab==="Final Flash"){if(!caster._charging){caster._charging=true;log.push("⚡ Charging Final Flash...");return{dmgToTarget:0,healCaster:0,skipTarget:false,block:0};}else{dmg=80;caster._charging=false;}}
  else if(ab==="Godspeed"){block=40;caster._speed=true;}
  else if(ab==="Infinity"){block=9999;}
  else if(ab==="Malevolent Shrine"){dmg=70;}
  else if(ab==="Three Sword Style"){dmg=25*3;}
  else if(ab==="Predator"){caster._copiedAbility=target.ability;}
  else if(ab==="Shadow Army"){dmg=40;}
  else if(ab==="ZA WARUDO"){dmg=45;skipTurn=true;}
  else if(ab==="ORA ORA ORA"){dmg=8*11;}
  else if(ab==="Insect Breathing"){dotDmg=8;dotTurns=4;}
  else if(ab==="Vector Control"){block=9999;caster._reflect=true;}
  else if(ab==="Death Note"){skipTurn=Math.random()<0.6;}
  else if(ab==="Geass"){skipTurn=true;}
  else if(ab==="Absorption"){heal=25;dmg=Math.round(caster.atk*0.9);caster.atk=Math.round(caster.atk*1.05);}
  else if(ab==="No Longer Human"){target._abilityDisabled=2;}
  else{// Default: ability does 30% more than normal attack
    dmg=Math.round(caster.atk*(0.9+Math.random()*0.5));
  }
  return{dmgToTarget:Math.max(0,dmg),healCaster:heal,skipTarget:skipTurn,block,dotDmg,dotTurns};
}

function battleRound(attacker,defender,useAbility,log){
  let abilRes={dmgToTarget:0,healCaster:0,skipTarget:false,block:0,dotDmg:0,dotTurns:0};
  if(useAbility&&!attacker._abilityUsed&&!attacker._abilityDisabled){
    abilRes=applyAbility(attacker,defender,log);
    attacker._abilityUsed=true;
    if(abilRes.dmgToTarget>0)log.push(`💥 ${attacker.name} uses ${attacker.ability}! ${abilRes.dmgToTarget} damage`);
    if(abilRes.healCaster!==0)log.push(`${abilRes.healCaster<0?'🤕':'💊'} ${attacker.name} ${abilRes.healCaster<0?'loses':'recovers'} ${Math.abs(abilRes.healCaster)} HP`);
    if(abilRes.skipTarget)log.push(`😵 ${defender.name} is stunned! Loses next action`);
  }else{
    const dmg=Math.max(1,Math.round((attacker.atk*(0.8+Math.random()*0.4))-(defender.def*(0.3+Math.random()*0.2))));
    abilRes.dmgToTarget=dmg;
    log.push(`⚔️ ${attacker.name} attacks for ${dmg} damage`);
  }
  // Apply defender's block
  const blocked=Math.min(abilRes.dmgToTarget,defender._block||0);
  const finalDmg=abilRes.dmgToTarget-blocked;
  if(blocked>0)log.push(`🛡 ${defender.name} blocks ${blocked}!`);
  defender.currentHp=Math.max(0,defender.currentHp-finalDmg);
  attacker.currentHp=Math.max(0,Math.min(attacker.hp,attacker.currentHp+(abilRes.healCaster||0)));
  // DOT
  if(abilRes.dotDmg&&abilRes.dotTurns){defender._dot={dmg:abilRes.dotDmg,turns:abilRes.dotTurns};}
  if(defender._dot&&defender._dot.turns>0){
    defender.currentHp=Math.max(0,defender.currentHp-defender._dot.dmg);
    log.push(`☠️ Poison: ${defender.name} takes ${defender._dot.dmg}`);
    defender._dot.turns--;
  }
  // Block fades
  if(abilRes.block)attacker._block=abilRes.block;
  else attacker._block=0;
  if(abilRes.skipTarget)defender._skip=true;
  return defender.currentHp<=0;
}

function simulateBattle(playerDeck,aiDeck){
  const pDeck=playerDeck.map(c=>({...c,currentHp:c.hp,_abilityUsed:false,_block:0,_skip:false}));
  const aDeck=aiDeck.map(c=>({...c,currentHp:c.hp,_abilityUsed:false,_block:0,_skip:false}));
  const allLog=[];let turn=0;
  let pi=0,ai=0;
  while(pi<pDeck.length&&ai<aDeck.length&&turn<200){
    const pc=pDeck[pi],ac=aDeck[ai];turn++;
    const log=[];
    log.push(`--- Turn ${turn} ---`);
    // Player turn
    if(pc._skip){log.push(`😵 ${pc.name} is stunned!`);pc._skip=false;}
    else{const useAb=!pc._abilityUsed&&Math.random()<0.5;if(battleRound(pc,ac,useAb,log)){log.push(`💀 ${ac.name} is defeated!`);ai++;}}
    // AI turn
    if(ai<aDeck.length){
      const ac2=aDeck[ai];
      if(ac2._skip){log.push(`😵 ${ac2.name} is stunned!`);ac2._skip=false;}
      else{const useAb=!ac2._abilityUsed&&Math.random()<0.6;if(battleRound(ac2,pc,useAb,log)){log.push(`💀 ${pc.name} is defeated!`);pi++;}}
    }
    allLog.push(...log);
  }
  return{playerWon:pi<pDeck.length&&ai>=aDeck.length,log:allLog,pDeck,aDeck};
}

// ── AnimeCardGame Component ───────────────────────────────────────────────────
function AnimeCardGame({cu,navigate}){
  const mob=useIsMobile();
  const[state,setState]=useState(()=>{
    const saved=loadAnimeState();
    return saved||freshAnimeState();
  });
  const[tab,setTab]=useState("home"); // home|collection|packs|deck|battle|results
  const[openingPack,setOpeningPack]=useState(false);
  const[newCards,setNewCards]=useState([]);
  const[revealIdx,setRevealIdx]=useState(0);
  const[battleState,setBattleState]=useState(null); // null|{log,result,...}
  const[filterRarity,setFilterRarity]=useState("All");
  const[filterSeries,setFilterSeries]=useState("All");
  const[sortBy,setSortBy]=useState("rarity");
  const[searchQ,setSearchQ]=useState("");
  const[deckMsg,setDeckMsg]=useState("");

  const persist=(patch)=>{const ns={...state,...patch};setState(ns);saveAnimeState(ns);};

  const allSeries=[...new Set(ANIME_CHARACTERS.map(c=>c[2]))].sort();

  // ── PACKS ─────────────────────────────────────────────────────────────────
  const openPack=(pack)=>{
    if(state.coins<pack.cost){setDeckMsg(`Need ${pack.cost} coins!`);setTimeout(()=>setDeckMsg(""),2000);return;}
    const pulled=[];
    for(let i=0;i<pack.cards;i++)pulled.push(pullCard(pack.rates));
    const newCol=[...state.collection,...pulled];
    persist({coins:state.coins-pack.cost,collection:newCol,totalPulls:state.totalPulls+pack.cards});
    setNewCards(pulled);setRevealIdx(0);setOpeningPack(true);
  };

  const nextReveal=()=>{
    if(revealIdx<newCards.length-1)setRevealIdx(r=>r+1);
    else{setOpeningPack(false);setNewCards([]);setRevealIdx(0);}
  };

  // ── DECK ──────────────────────────────────────────────────────────────────
  const addToDeck=(card)=>{
    if(state.deck.length>=5){setDeckMsg("Deck is full! (max 5)");setTimeout(()=>setDeckMsg(""),2000);return;}
    if(state.deck.find(c=>c.instanceId===card.instanceId)){setDeckMsg("Already in deck");setTimeout(()=>setDeckMsg(""),2000);return;}
    persist({deck:[...state.deck,card]});
  };
  const removeFromDeck=(iid)=>persist({deck:state.deck.filter(c=>c.instanceId!==iid)});

  // ── BATTLE ────────────────────────────────────────────────────────────────
  const startBattle=()=>{
    if(state.deck.length<3){setDeckMsg("Need at least 3 cards in deck!");setTimeout(()=>setDeckMsg(""),2500);return;}
    const ai=buildAIDeck();
    const res=simulateBattle(state.deck,ai);
    const newWins=res.playerWon?state.wins+1:state.wins;
    const newLosses=res.playerWon?state.losses:state.losses+1;
    const reward=res.playerWon?150:30;
    persist({coins:state.coins+reward,wins:newWins,losses:newLosses,
      battleHistory:[{won:res.playerWon,opponent:ai.map(c=>c.name).join(", "),date:Date.now()},...state.battleHistory.slice(0,9)]});
    setBattleState({...res,aiDeckCards:ai,reward});
    setTab("battle");
  };

  // ── Collection filtering ──────────────────────────────────────────────────
  const filteredCol=state.collection.filter(c=>{
    if(filterRarity!=="All"&&c.rarity!==filterRarity)return false;
    if(filterSeries!=="All"&&c.series!==filterSeries)return false;
    if(searchQ&&!c.name.toLowerCase().includes(searchQ.toLowerCase()))return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="rarity")return RARITY_ORDER.indexOf(a.rarity)-RARITY_ORDER.indexOf(b.rarity);
    if(sortBy==="atk")return b.atk-a.atk;
    if(sortBy==="name")return a.name.localeCompare(b.name);
    return 0;
  });

  const accentColor="#E040FB";

  // ── CARD COMPONENT ────────────────────────────────────────────────────────
  const AnimeCard=({card,size="md",onClick,inDeck,onRemove})=>{
    const rc=RARITY_COLORS[card.rarity]||"#64748B";
    const ec=ELEMENT_COLORS[card.element]||"#64748B";
    const tc=TYPE_COLORS[card.type]||"#64748B";
    const sm=size==="sm";
    return(
      <div onClick={onClick} style={{
        borderRadius:sm?10:14,cursor:onClick?"pointer":"default",
        border:`2px solid ${rc}`,
        background:`linear-gradient(160deg,rgba(0,0,0,.85),${ec}18)`,
        overflow:"hidden",transition:"transform .18s,box-shadow .18s",
        width:sm?120:mob?140:160,flexShrink:0,
        boxShadow:`0 4px 20px ${rc}44`,
        position:"relative",
      }}
        onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 8px 32px ${rc}88`;}}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 4px 20px ${rc}44`;}}>
        {/* Rarity glow bar */}
        <div style={{height:3,background:rc,width:"100%"}}/>
        {/* Card header */}
        <div style={{padding:sm?"6px 8px":"8px 10px",background:`${rc}22`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:sm?7:8,color:rc,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{card.rarity.toUpperCase()}</div>
            <div style={{fontSize:sm?10:13}}>{ELEMENT_EMOJI[card.element]||"⚡"}</div>
          </div>
        </div>
        {/* Character avatar (emoji-based visual) */}
        <div style={{height:sm?60:80,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(180deg,${ec}18,transparent)`,fontSize:sm?32:44}}>
          {card.type==="Fighter"?"🥷":card.type==="Mage"?"🧙":card.type==="Demon"?"😈":"💊"}
        </div>
        {/* Name & series */}
        <div style={{padding:sm?"4px 8px":"6px 10px"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:sm?8:10,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name}</div>
          {!sm&&<div style={{fontSize:8,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.series}</div>}
        </div>
        {/* Stats */}
        <div style={{padding:sm?"0 8px 6px":"0 10px 8px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>
          {[["ATK",card.atk,"#EF4444"],["DEF",card.def,"#3B82F6"],["HP",card.hp,"#22C55E"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",padding:"2px 0",borderRadius:4,background:"rgba(0,0,0,.3)"}}>
              <div style={{fontSize:sm?6:7,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{l}</div>
              <div style={{fontSize:sm?9:11,color:c,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{v}</div>
            </div>
          ))}
        </div>
        {/* Ability name */}
        {!sm&&(
          <div style={{padding:"0 10px 8px"}}>
            <div style={{fontSize:8,color:rc,fontFamily:"'Orbitron',sans-serif",fontWeight:700,padding:"2px 6px",borderRadius:5,background:`${rc}18`,border:`1px solid ${rc}33`,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.ability}</div>
          </div>
        )}
        {/* Type badge */}
        <div style={{position:"absolute",top:20,right:6,fontSize:7,color:tc,fontFamily:"'Orbitron',sans-serif",fontWeight:700,background:`${tc}22`,padding:"1px 4px",borderRadius:4}}>{card.type}</div>
        {/* In deck badge */}
        {inDeck&&<div style={{position:"absolute",top:20,left:6,fontSize:8,background:"#22C55E",color:"#fff",borderRadius:4,padding:"1px 5px",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✓</div>}
        {/* Remove from deck button */}
        {onRemove&&<button onClick={e=>{e.stopPropagation();onRemove(card.instanceId);}} style={{position:"absolute",bottom:6,right:6,background:"rgba(239,68,68,.8)",border:"none",borderRadius:4,color:"#fff",cursor:"pointer",fontSize:10,padding:"1px 5px"}}>×</button>}
      </div>
    );
  };

  // ── PACK OPENING SCREEN ───────────────────────────────────────────────────
  if(openingPack){
    const card=newCards[revealIdx];
    const rc=RARITY_COLORS[card?.rarity]||"#64748B";
    return(
      <div style={{maxWidth:500,margin:"0 auto",padding:"20px",textAlign:"center"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#475569",marginBottom:4}}>{revealIdx+1} / {newCards.length}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:rc,marginBottom:20,letterSpacing:".08em"}}>{card?.rarity.toUpperCase()}!</div>
        {card&&(
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <AnimeCard card={card} size="lg"/>
          </div>
        )}
        <div style={{fontSize:11,color:"#64748B",marginBottom:16}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{card?.name}</div>
          <div style={{fontSize:10,color:"#94A3B8"}}>{card?.series}</div>
          <div style={{fontSize:10,color:rc,marginTop:4}}>{card?.ability} — {card?.abilityDesc}</div>
        </div>
        <button onClick={nextReveal} style={{padding:"12px 32px",borderRadius:14,background:`linear-gradient(135deg,${rc},${rc}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#fff"}}>
          {revealIdx<newCards.length-1?"NEXT CARD ▶":"DONE ✓"}
        </button>
      </div>
    );
  }

  // ── BATTLE SCREEN ─────────────────────────────────────────────────────────
  if(tab==="battle"&&battleState){
    const won=battleState.playerWon;
    return(
      <div style={{maxWidth:700,margin:"0 auto",padding:mob?"10px":"20px"}}>
        <div style={{textAlign:"center",padding:"20px",borderRadius:18,background:won?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",border:`2px solid ${won?"rgba(34,197,94,.4)":"rgba(239,68,68,.3)"}`,marginBottom:18}}>
          <div style={{fontSize:52,marginBottom:8}}>{won?"🏆":"💀"}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,fontWeight:900,color:won?"#22C55E":"#EF4444"}}>{won?"VICTORY!":"DEFEAT"}</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>+{battleState.reward} coins earned</div>
        </div>
        {/* Battle log */}
        <div style={{maxHeight:300,overflowY:"auto",padding:"12px 14px",borderRadius:12,background:"rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.07)",marginBottom:14,fontFamily:"monospace",fontSize:11,lineHeight:1.8}}>
          {battleState.log.map((l,i)=>(
            <div key={i} style={{color:l.startsWith("---")?"#475569":l.includes("defeated")?"#EF4444":l.includes("heals")||l.includes("recovers")?"#22C55E":"#94A3B8"}}>{l}</div>
          ))}
        </div>
        {/* Card states */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {[["Your Cards",battleState.pDeck,"#22C55E"],["Opponent",battleState.aDeck,"#EF4444"]].map(([label,deck,col])=>(
            <div key={label} style={{padding:"12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${col}33`}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:col,marginBottom:8}}>{label}</div>
              {deck.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.04)",color:c.currentHp<=0?"#EF4444":"#94A3B8"}}>
                  <span>{c.name}</span>
                  <span style={{fontFamily:"'Orbitron',sans-serif",color:c.currentHp<=0?"#EF4444":"#22C55E"}}>{c.currentHp<=0?"KO":`${c.currentHp}HP`}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button onClick={()=>{setBattleState(null);setTab("home");}} style={{width:"100%",padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${accentColor},${accentColor}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:"#fff"}}>← BACK TO HQ</button>
      </div>
    );
  }

  // ── MAIN LAYOUT ───────────────────────────────────────────────────────────
  const tabList=[["home","🏠 Home"],["collection","📦 Collection"],["packs","🎁 Packs"],["deck","⚔️ Deck Builder"],["battle","🥊 Battle"]];

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:mob?"8px 8px 100px":"16px 20px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:24,fontWeight:900,color:accentColor,letterSpacing:".06em"}}>🌸 ANIME CARDS</div>
          <div style={{fontSize:10,color:"#475569"}}>{ANIME_CHARACTERS.length} characters · {state.collection.length} collected</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{padding:"6px 14px",borderRadius:20,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#F59E0B"}}>
            🪙 {state.coins.toLocaleString()}
          </div>
          <div style={{fontSize:10,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>{state.wins}W–{state.losses}L</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {tabList.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:20,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:mob?9:10,fontWeight:700,border:`1px solid ${tab===t?accentColor+"66":"rgba(255,255,255,.08)"}`,background:tab===t?accentColor+"18":"rgba(255,255,255,.03)",color:tab===t?accentColor:"#475569",transition:"all .15s"}}>
            {l}{t==="deck"&&state.deck.length>0?` (${state.deck.length}/5)`:""}
          </button>
        ))}
      </div>

      {deckMsg&&<div style={{marginBottom:12,padding:"8px 14px",borderRadius:10,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",color:"#EF4444",fontSize:12,fontFamily:"'Orbitron',sans-serif"}}>{deckMsg}</div>}

      {/* ── HOME ── */}
      {tab==="home"&&(
        <div>
          {/* Stats banner */}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:20}}>
            {[["Cards Owned",state.collection.length,accentColor],["Total Pulls",state.totalPulls,"#F59E0B"],["Battle W",state.wins,"#22C55E"],["Battle L",state.losses,"#EF4444"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"14px",borderRadius:14,background:"rgba(255,255,255,.04)",border:`1px solid ${c}33`}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{l}</div>
              </div>
            ))}
          </div>
          {/* Quick actions */}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[
              {label:"Open Standard Pack",cost:"100 🪙",col:"#475569",action:()=>{openPack(PACK_TYPES[0]);setTab("packs");}},
              {label:"Open Premium Pack",cost:"300 🪙",col:"#7C3AED",action:()=>{openPack(PACK_TYPES[1]);setTab("packs");}},
              {label:"Go Battle!",cost:state.deck.length>=3?"Ready!":"Need 3+ cards",col:"#EF4444",action:startBattle},
            ].map(({label,cost,col,action})=>(
              <button key={label} onClick={action} style={{padding:"16px",borderRadius:14,cursor:"pointer",border:`2px solid ${col}55`,background:`${col}18`,fontFamily:"'Orbitron',sans-serif",textAlign:"left",transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${col}28`}
                onMouseLeave={e=>e.currentTarget.style.background=`${col}18`}>
                <div style={{fontSize:11,fontWeight:700,color:col,marginBottom:4}}>{label}</div>
                <div style={{fontSize:10,color:"#64748B"}}>{cost}</div>
              </button>
            ))}
          </div>
          {/* Recent cards */}
          {state.collection.length>0&&(
            <div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:10}}>RECENTLY PULLED</div>
              <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                {[...state.collection].reverse().slice(0,8).map((c,i)=>(
                  <AnimeCard key={i} card={c} size="sm"/>
                ))}
              </div>
            </div>
          )}
          {state.collection.length===0&&(
            <div style={{textAlign:"center",padding:"40px",color:"#334155"}}>
              <div style={{fontSize:48,marginBottom:12}}>🌸</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#94A3B8",marginBottom:8}}>No cards yet!</div>
              <div style={{fontSize:11}}>Open a pack to start your collection</div>
            </div>
          )}
        </div>
      )}

      {/* ── COLLECTION ── */}
      {tab==="collection"&&(
        <div>
          {/* Filters */}
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search characters…" style={{flex:1,minWidth:140,padding:"7px 12px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:12}}/>
            <select value={filterRarity} onChange={e=>setFilterRarity(e.target.value)} style={{padding:"6px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
              <option value="All">All Rarities</option>
              {RARITY_ORDER.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filterSeries} onChange={e=>setFilterSeries(e.target.value)} style={{padding:"6px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
              <option value="All">All Series</option>
              {allSeries.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"6px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
              <option value="rarity">Sort: Rarity</option>
              <option value="atk">Sort: ATK</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
          <div style={{fontSize:10,color:"#334155",marginBottom:10}}>{filteredCol.length} cards</div>
          {filteredCol.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#334155",fontSize:12}}>{state.collection.length===0?"No cards yet — open some packs!":"No cards match your filters"}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {filteredCol.map((c,i)=>{
              const inDeck=!!state.deck.find(d=>d.instanceId===c.instanceId);
              return<AnimeCard key={i} card={c} onClick={()=>addToDeck(c)} inDeck={inDeck}/>;
            })}
          </div>
          {filteredCol.length>0&&<div style={{fontSize:10,color:"#334155",marginTop:12,textAlign:"center"}}>Click any card to add to deck</div>}
        </div>
      )}

      {/* ── PACKS ── */}
      {tab==="packs"&&(
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:14}}>CHOOSE A PACK</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {PACK_TYPES.map(pack=>(
              <div key={pack.id} style={{borderRadius:14,border:`2px solid ${pack.color}44`,background:`${pack.color}10`,padding:"16px",cursor:"pointer",transition:"all .2s"}}
                onClick={()=>openPack(pack)}
                onMouseEnter={e=>e.currentTarget.style.background=`${pack.color}20`}
                onMouseLeave={e=>e.currentTarget.style.background=`${pack.color}10`}>
                <div style={{fontSize:32,textAlign:"center",marginBottom:8}}>🎁</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:pack.color,marginBottom:4,textAlign:"center"}}>{pack.name}</div>
                <div style={{fontSize:10,color:"#64748B",textAlign:"center",marginBottom:8}}>{pack.desc}</div>
                <div style={{textAlign:"center",padding:"6px",borderRadius:10,background:`${pack.color}22`,border:`1px solid ${pack.color}44`,fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:pack.color}}>🪙 {pack.cost}</div>
              </div>
            ))}
          </div>
          {/* Drop rates table */}
          <div style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:10}}>DROP RATES — STANDARD PACK</div>
            {RARITY_ORDER.map(r=>(
              <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:11,color:RARITY_COLORS[r],fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{r}</span>
                <span style={{fontSize:11,color:"#94A3B8"}}>{(RARITY_RATES[r]*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DECK BUILDER ── */}
      {tab==="deck"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8"}}>YOUR BATTLE DECK ({state.deck.length}/5)</div>
              <div style={{fontSize:10,color:"#334155"}}>Select 3-5 cards. Click cards in collection to add.</div>
            </div>
            <button onClick={()=>persist({deck:[]})} style={{padding:"6px 14px",borderRadius:10,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:"#EF4444",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>Clear Deck</button>
          </div>
          {state.deck.length===0&&(
            <div style={{textAlign:"center",padding:"40px",color:"#334155"}}>
              <div style={{fontSize:36,marginBottom:8}}>⚔️</div>
              <div style={{fontSize:12}}>Deck is empty — go to Collection and click cards to add them</div>
            </div>
          )}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            {state.deck.map((c,i)=>(
              <AnimeCard key={i} card={c} onRemove={removeFromDeck}/>
            ))}
          </div>
          {state.deck.length>=3&&(
            <button onClick={startBattle} style={{width:"100%",padding:"14px",borderRadius:14,background:`linear-gradient(135deg,#EF4444,#EF4444cc)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#fff"}}>
              ⚔️ BATTLE WITH THIS DECK →
            </button>
          )}
          {state.deck.length>0&&state.deck.length<3&&(
            <div style={{textAlign:"center",padding:"10px",color:"#F59E0B",fontSize:11,fontFamily:"'Orbitron',sans-serif"}}>Add {3-state.deck.length} more card{3-state.deck.length!==1?"s":""} to battle</div>
          )}
        </div>
      )}

      {/* ── BATTLE HOME ── */}
      {tab==="battle"&&!battleState&&(
        <div>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:48,marginBottom:8}}>⚔️</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#EF4444",marginBottom:8}}>BATTLE ARENA</div>
            <div style={{fontSize:12,color:"#64748B"}}>Your deck vs a random AI opponent</div>
          </div>
          {state.deck.length>=3?(
            <>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:10}}>YOUR BATTLE DECK</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
                {state.deck.map((c,i)=><AnimeCard key={i} card={c} size="sm"/>)}
              </div>
              <button onClick={startBattle} style={{width:"100%",padding:"16px",borderRadius:14,background:"linear-gradient(135deg,#EF4444,#7C3AED)",border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#fff",letterSpacing:".06em"}}>
                ⚔️ START BATTLE →
              </button>
            </>
          ):(
            <div style={{textAlign:"center",padding:"30px",color:"#334155"}}>
              <div style={{fontSize:12,marginBottom:12}}>You need at least 3 cards in your deck</div>
              <button onClick={()=>setTab("deck")} style={{padding:"10px 24px",borderRadius:12,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",color:"#EF4444",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700}}>Build Deck →</button>
            </div>
          )}
          {/* Battle history */}
          {state.battleHistory.length>0&&(
            <div style={{marginTop:20}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:10}}>RECENT BATTLES</div>
              {state.battleHistory.slice(0,5).map((b,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:`1px solid ${b.won?"rgba(34,197,94,.2)":"rgba(239,68,68,.15)"}`,marginBottom:5}}>
                  <span style={{fontSize:11,color:b.won?"#22C55E":"#EF4444",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{b.won?"WIN":"LOSS"}</span>
                  <span style={{fontSize:10,color:"#64748B"}}>vs {b.opponent.split(",")[0]}…</span>
                  <span style={{fontSize:9,color:"#334155"}}>{new Date(b.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}






export default function App(){
  const DISCORD_URL="https://discord.gg/your-invite-here";
  const[cu,setCu]=useState(()=>getSess());
  const[users,setUsers]=useState([]);
  const[page,setPage]=useState("home");
  const[profileId,setProfileId]=useState(null);
  const[gameRef,setGameRef]=useState(null);
  const[statsPlayerRef,setStatsPlayerRef]=useState(null);
  const[showLogin,setShowLogin]=useState(false);
  const[showRegister,setShowRegister]=useState(false);
  const[notifs,setNotifs]=useState([]);
  const[conversations,setConversations]=useState([]);
  const[messages,setMessages]=useState([]);
  const[likes,setLikes]=useState({});
  const[msgUnread,setMsgUnread]=useState(0);

  useEffect(()=>{loadAll();},[]);

  const loadAll=async()=>{
    const[us,ls]=await Promise.all([
      sb.get("nova_users","?order=joined.asc"),
      sb.get("nova_clip_likes","?order=ts.desc"),
    ]);
    if(us)setUsers(us);
    if(ls){
      const map={};
      ls.forEach(l=>{if(!map[l.clip_id])map[l.clip_id]=[];map[l.clip_id].push(l.user_id);});
      setLikes(map);
    }
  };

  useEffect(()=>{
    if(!cu)return;
    const loadNotifs=async()=>{
      const data=await sb.get("nova_notifications",`?to_user_id=eq.${cu.id}&order=ts.desc&limit=30`);
      if(data)setNotifs(data);
    };
    loadNotifs();
    const t=setInterval(loadNotifs,15000);
    return()=>clearInterval(t);
  },[cu?.id]);

  useEffect(()=>{
    if(!cu)return;
    const loadConvs=async()=>{
      const data=await sb.get("nova_conversations",`?members=cs.{${cu.id}}`);
      if(data)setConversations(data);
    };
    loadConvs();
  },[cu?.id]);

  useEffect(()=>{
    if(!cu||!conversations.length)return;
    const unread=conversations.filter(c=>{
      const msgs=messages.filter(m=>m.conv_id===c.id);
      if(!msgs.length)return c.last_msg&&c.last_sender&&c.last_sender!==cu.display_name;
      const last=msgs[msgs.length-1];
      return last&&last.author_id!==cu.id;
    }).length;
    setMsgUnread(unread);
  },[conversations,messages,cu?.id]);

  const [navOpts,setNavOpts]=useState({});
  const nav=(p,id,opts={})=>{
    if(p==="profile"&&id){setProfileId(id);}
    if(p==="game"&&id){setGameRef(id);} // id = {id, sport}
    if(p==="stats"&&id?.playerId){setStatsPlayerRef(id);} // id = {playerId, sport}
    if((p==="predict"||p==="news")&&!id){return nav("hub");} // redirect to hub
    setNavOpts(opts||{});
    setPage(p);
  };

  const addNotif=async(toId,fromId,msg,meta=null)=>{
    const n={id:gid(),to_user_id:toId,from_user_id:fromId,msg,ts:Date.now(),read:false,meta};
    await sb.post("nova_notifications",n);
  };

  const handleLogin=u=>{setCu(u);setShowLogin(false);};
  const handleRegister=u=>{setCu(u);setShowRegister(false);setUsers(prev=>[...prev,u]);};
  const handleLogout=()=>{clearSess();setCu(null);setPage("home");};

  const readNotifs=async()=>{
    const unread=notifs.filter(n=>!n.read);
    if(!unread.length)return;
    await Promise.all(unread.map(n=>sb.patch("nova_notifications",`?id=eq.${n.id}`,{read:true})));
    setNotifs(prev=>prev.map(n=>({...n,read:true})));
  };
  const markOneNotif=async(nid)=>{
    await sb.patch("nova_notifications",`?id=eq.${nid}`,{read:true});
    setNotifs(prev=>prev.map(n=>n.id===nid?{...n,read:true}:n));
  };
  const clearNotifs=async()=>{
    if(!cu)return;
    await sb.del("nova_notifications",`?to_user_id=eq.${cu.id}`);
    setNotifs([]);
  };

  const handleLike=async(clipId,alreadyLiked)=>{
    if(!cu)return;
    if(alreadyLiked){
      await sb.del("nova_clip_likes",`?clip_id=eq.${clipId}&user_id=eq.${cu.id}`);
      setLikes(prev=>({...prev,[clipId]:(prev[clipId]||[]).filter(id=>id!==cu.id)}));
    } else {
      const l={id:gid(),clip_id:clipId,user_id:cu.id,ts:Date.now()};
      await sb.post("nova_clip_likes",l);
      setLikes(prev=>({...prev,[clipId]:[...(prev[clipId]||[]),cu.id]}));
    }
  };

  const staffUsers=users.filter(u=>u.is_owner||u.staff_role);
  const mob=useIsMobile();

  const content=()=>{
    if(page==="profile"&&profileId)return <ProfilePage userId={profileId} cu={cu} users={users} setUsers={updater=>{const next=typeof updater==="function"?updater(users):updater;setUsers(next);if(cu){const up=next.find(x=>x.id===cu.id);if(up)setCu(up);}}} navigate={nav} addNotif={addNotif} navOpts={navOpts}/>;
    if(page==="news")return <NewsPage cu={cu} users={users} addNotif={addNotif} navOpts={navOpts}/>;
    if(page==="members")return <MembersPage users={users} nav={nav}/>;
    if(page==="feed")return <FeedPage users={users} cu={cu} likes={likes} onLike={handleLike} navigate={nav}/>;
    if(page==="game"&&gameRef)return <GameDetailPage gameId={gameRef.id} sport={gameRef.sport} navigate={nav}/>;
    if(page==="predict")return <PredictPage cu={cu} users={users} setUsers={setUsers} navigate={nav}/>;
    if(page==="matchup")return<MatchupPage/>;
    if(page==="animecards")return<AnimeCardGame cu={cu} navigate={nav}/>;
    if(page==="hub")return <HubPage cu={cu} users={users} setUsers={setUsers} navigate={nav}/>;
    if(page==="stats")return <StatsPage navigate={nav} initPlayer={statsPlayerRef?.id||null} initSport={statsPlayerRef?.sport||null}/>;
    if(page==="nffl")return <NFFLPage cu={cu} users={users} navigate={nav}/>;
    if(page==="ringrush")return <RingRushPage cu={cu} users={users} navigate={nav}/>;
    if(page==="nbbl")return <NBBLPage cu={cu} users={users} navigate={nav}/>;
<<<<<<< HEAD
    if(page==="gmmode")if(page==="gmmode") return <GMGame cu={cu}/>;
if(page==="rtts") return <RTTSMode cu={cu}/>;
=======
    if(page==="gmmode")return <GMGame cu={cu}/>;
>>>>>>> 3a37ea0 (Add RTTS mode)
    if(page==="cards")return <CardsPage cu={cu}/>;
    if(page==="trivia")return <TriviaPage cu={cu}/>;
    if(page==="leaderboard")return <LeaderboardPage users={users} navigate={nav}/>;
    if(page==="messages")return <MessagesPage cu={cu} users={users} conversations={conversations} setConversations={setConversations} messages={messages} setMessages={setMessages}/>;
    if(page==="dashboard")return <DashboardPage cu={cu} users={users} setUsers={updater=>{const next=typeof updater==="function"?updater(users):updater;setUsers(next);if(cu){const up=next.find(x=>x.id===cu.id);if(up)setCu(up);}}} navigate={nav}/>;
    return <HomePage discordUrl={DISCORD_URL} staffUsers={staffUsers} nav={nav} users={users}/>;
  };

  return(
    <>
      <style>{CSS}</style>
      <Starfield/>
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",paddingTop:62,paddingBottom:mob&&page!=="feed"?58:0}}>
        <Navbar cu={cu} onLogin={()=>setShowLogin(true)} onRegister={()=>setShowRegister(true)} onLogout={handleLogout} nav={nav} page={page} notifs={notifs} onReadNotifs={readNotifs} onClearNotifs={clearNotifs} onMarkOneNotif={markOneNotif} users={users} msgUnread={msgUnread}/>
        {content()}
      </div>
      {showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)} users={users}/>}
      {showRegister&&<RegisterModal onRegister={handleRegister} onClose={()=>setShowRegister(false)}/>}
    </>
  );
}
