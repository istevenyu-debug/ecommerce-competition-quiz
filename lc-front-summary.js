/* Chapter 12 source summaries only. No quiz, score, timer or storage changes. */
(function (global, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { global.LCFrontSummary = api; api.install(document); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '20261019-LC45';
  // source|coverage (audit only, not rendered)|heading|original-source extract
  // RULE entries are labelled supplements rather than words from the source PDF.
  const definitions = String.raw`
[T56-1]
58·40A|ACD|信用狀形式|IRREVOCABLE；本狀未另列 TRANSFERABLE 或循環使用條款。
58·41D|BD|指定銀行與使用方式|SMILE COMMERCIAL BANK FUSING BRANCH BY NEGOTIATION。
58·42C|BD|匯票期限|SIGHT FOR FULL INVOICE VALUE。
58·49|A|保兌指示|WITHOUT。
[T56-2]
58·31C|B|開狀日|141108（2014/11/08）。
58·31D|CD|有效期限|DATE 141208 TAIWAN（2014/12/08，台灣）。
58·48|CD|提示期限|WITHIN 10 DAYS AFTER DATE OF SHIPMENT BUT WITHIN THE VALIDITY OF THE CREDIT。
58·全狀、45A|ACD|裝運期限與訂單編號|本狀沒有另列 44C 最後裝運日；45A 的 PURCHASE ORDER NO.141010 是訂單編號，不是本狀的裝運日期欄。
[T56-3]
58·43P|A|分批裝運|ALLOWED。
58·40E|B|適用規則|UCP LATEST VERSION；這份信用狀的開狀年份為 2014。
58·42C|C|匯票金額範圍|SIGHT FOR FULL INVOICE VALUE。
58·46A|D|保險文件名稱|MARINE INSURANCE POLICY/CERTIFICATE。
[T56-4]
58·46A|A|保險單據形式|MARINE INSURANCE POLICY/CERTIFICATE IN NEGOTIABLE FORM。
58·46A|B|理賠地點|CLAIMS PAYABLE IN PARIS。
58·32B、46A|C|信用狀幣別與理賠幣別|32B：CURRENCY EUR；46A：IN THE CURRENCY OF THE DRAFT。
58·46A|D|本狀列出的險別|INSTITUTE CARGO CLAUSES (A)、INSTITUTE WAR CLAUSES (CARGO)；該保險段未列 STRIKES CLAUSES。
[T56-5]
58·31C、46A|ABCD|開狀日與要求文件|31C：141108。46A：COMMERCIAL INVOICE IN TRIPLICATE；PACKING LIST IN DUPLICATE；發票條款未寫 SIGNED。
RULE:ISBP745 C1|A|發票名稱通則|要求 COMMERCIAL INVOICE 時，名稱為 INVOICE 的文件亦可符合名稱要求，仍須審查其他內容。
RULE:UCP600 18(a)(iv)|B|發票簽署通則|除信用狀另有要求外，商業發票不必簽署。
RULE:UCP600 17(e)|C|多份文件通則|IN DUPLICATE 可由至少一份正本及其餘副本滿足；除非文件本身另有表示，不能只以兩份副本取代。
RULE:UCP600 14(i)、1|D|文件日期通則|文件可以早於開狀日，但不得晚於提示日；信用狀若明確另作限制，須依該限制。
[T56-6]
59·匯票、58·42C|ABCD|空格與匯票要求|匯票 (1) 位於 EXCHANGE FOR；42C：SIGHT FOR FULL INVOICE VALUE。
59·發票商品明細|ABCD|本批第一項貨品|AD-12：1,200 sets，EUR20.00/set。
59·發票商品明細|ABCD|本批第二項貨品|BC-34：800 sets，EUR15.00/set；本張發票合計 2,000 sets。
58·32B、43P、46A|ABD|信用狀總額與保險比例|信用狀 EUR90,000.00，分批 ALLOWED；保險要求 FULL INVOICE VALUE PLUS 10 PERCENT。信用狀總額、匯票款與保險金額是不同欄位。
[T56-7]
59·發票|ABCD|待填欄位|空格 (5) 在 Per 後面，右方是 Sailing on or about。
60·提單|D|實際船名與航次|Ocean Vessel：BREVIK BRIDGE；Voy. No.：S124。
60·提單|A|運送人|單據上方及簽署欄均印有 WIN LINE LTD.，簽署身分為 As Carrier。
58·59、45A|BC|受益人與嘜頭|Beneficiary：BEN CO., LTD.；SHIPPING MARK：APP (IN TRI.)。
[T56-8]
59·發票|ABCD|待填欄位位置|空格 (7) 位於發票左下方、合約及採購訂單文字下方；不是 Per (5) 或價格條件 (6)。
58·46A|A|發票必須記載|COMMERCIAL INVOICE IN TRIPLICATE SHOWING COUNTRY OF ORIGIN IS VIETNAM。
58·45A|BC|價格條件與嘜頭|CIF MARSEILLE；SHIPPING MARK：APP (IN TRI.)。
58·46A|D|另要求的受益人證明|證明 ONE COPY EACH OF COMMERCIAL INVOICE AND PACKING LIST 已於裝船後兩天內寄給 APPLICANT；原條款說的是 COPY。
[T57-9]
59·匯票、58·52A、41D|A|DRAWN UNDER (2) 的核對資料|開狀銀行：WELL COMMERCIAL BANK, PARIS；指定讓購銀行：SMILE COMMERCIAL BANK FUSING BRANCH。
59·匯票、58·59|B|匯票右下 (4) 的核對資料|右下空格為出票簽署區；信用狀受益人是 BEN CO., LTD.，4F, NO. 200, SEC. 2, FUSING S. RD., TAIPEI, TAIWAN。
59·發票、58·45A|C|發票 (6) 的核對資料|空格在商品價款欄；45A 的交易條件為 CIF MARSEILLE。
60·提單、58·50|D|Notify Party (10) 的核對資料|Applicant：APP CO., LTD., 22, RUE DU GRENIER-SAINT-LAZARE, PARIS, FRANCE。
58·46A|D|提單通知人要求|完整海運提單要求包括 MADE OUT TO ORDER AND BLANK ENDORSED、HAPPY CO. AS SHIPPER、FREIGHT PREPAID AND NOTIFY APPLICANT。
[T57-10]
60·提單、58·46A、59|A|Shipper (8)|46A 指定 HAPPY CO., VINCOM CENTRE, 20/F 300 PASTEUR STREET, DISTRICT 1, HO CHI MINH CITY, SOCIALIST REPUBLIC OF VIETNAM AS SHIPPER；59 的受益人另為 BEN CO., LTD.。
60·提單、58·44F|B|Port of Discharge (11)|44F：MARSEILLE, FRANCE。
60·提單、58·46A|C|Freight to be (12)|46A：MARKED FREIGHT PREPAID；原欄供勾選 PREPAID 或 COLLECT。
60·提單|D|TOTAL (13) 所需件數|No. of Pkgs. or Containers：100 CTNS.；下方為 TOTAL … (13) … ONLY。
60·提單|D|不要混用另一種「份數」|Number of Original B/L(s)：THREE (3)，是提單正本份數；100 CTNS. 是貨物包裝件數。
[T61-1]
63·40A|ABC|信用狀形式|IRREVOCABLE TRANSFERABLE WITHOUT CONFIRMATION。
63·41D|AD|可使用銀行與方式|ANY BANK BY NEGOTIATION。
63·42C|AB|匯票期限|180 DAYS FROM BILL OF LADING DATE。
63·42A|AD|匯票付款人|ORBCINBBSPC：ORIENTAL BANK OF COMMERCE。
[T61-2]
63·電文表頭|AB|Sender|ORBCINBBSPC；ORIENTAL BANK OF COMMERCE。
63·電文表頭|BCD|Receiver|TCBBTWTHXXX；TAICHUNG COMMERCIAL BANK。
63·42A|ACD|Drawee|ORBCINBBSPC；ORIENTAL BANK OF COMMERCE。
63·47A|BD|轉讓銀行限制|TRANSFER IS RESTRICTED TO ADVISING BANK。
63·50、41D|C|其他角色|Applicant：SUPERSTRONG CO.；Available with/by：ANY BANK BY NEGOTIATION。Applicant 與匯票付款人是分開的欄位。
[T61-3]
65·提單|ABCD|實際裝船日|Shipped on Board Date：MAR. 23, 2017；提單簽發日亦為 MAR. 23, 2017。
63·48|ABCD|提示期間|WITHIN 14 DAYS AFTER THE DATE OF SHIPMENT BUT WITHIN CREDIT VALIDITY。
63·31D|ABCD|信用狀到期日|170331 TAIWAN（2017/03/31）。
63·44C|ACD|最後裝運期限|170324（2017/03/24）；這是最遲准許裝運日，不是提單記載的實際裝船日。
[T61-4]
63·46A|A|提單份數與形式|FULL SET OF CLEAN ON BOARD BILLS OF LADING。
63·47A|B|簡式提單|SHORT FORM BILL OF LADING IS NOT ACCEPTABLE。
63·46A|C|產地證明書出具人|CERTIFICATE OF ORIGIN IN DUPLICATE ISSUED BY CHAMBER OF COMMERCE。
63·31C、47A|D|運送文件日期限制|31C：170207；TRANSPORT DOCUMENTS BEARING DATE OF ISSUANCE PRIOR TO THE DATE OF ISSUANCE OF THIS CREDIT IS NOT ACCEPTABLE。
[T61-5]
63·46A|D|保險文件類型|MARINE INSURANCE POLICY/CERTIFICATE IN DUPLICATE。
63·46A|C|投保金額|110 PCT OF INVOICE VALUE。
63·46A|B|保險條款所列險別|INSTITUTE CARGO CLAUSES (A)、INSTITUTE WAR CLAUSES (CARGO)；該段未列 STRIKES CLAUSES。
63·46A|A|理賠地點|WITH CLAIMS PAYABLE IN INDIA。
[T61-6]
64·發票|ABCD|空格 (1) 的實際位置|在 YOUNG COMPANY LIMITED 抬頭下方、No.1234 上方，是整份文件的名稱欄；不是 INVOICE of 的商品內容。
63·46A|ABCD|信用狀對發票的要求|SIGNED INVOICE IN THREE COPIES STATING THE GOODS ARE OF TAIWAN ORIGIN。
RULE:ISBP745 C1(a)|ABD|一般 INVOICE 名稱範圍|信用狀只要求 INVOICE 時，可接受 commercial、customs、consular 等發票種類；內容仍須符合其餘條件。
RULE:ISBP745 C1(a)|C|暫定發票名稱限制|發票不得以 provisional、pro-forma 或同類用語表明它僅為暫定文件。
[T61-7]
64·發票、63·50、59|A|For account and risk of Messrs. (2)|Applicant：SUPERSTRONG CO., 543, ANNA SALAI, CHENNAI 600 002, INDIA；Beneficiary 另為 YOUNG CO., LTD., NO.123 DAYE RD., NANTUN DIST., TAICHUNG CITY, TAIWAN。
64·發票、65·提單|B|Shipped Per (3)|提單 Ocean Vessel：QUEEN；Voy. No.：001E-033。
64·發票、65·提單|C|From (4)|原提單的 Port of Loading 與 Place of Receipt 均為 TAICHUNG, TAIWAN。
64·發票、63·45A|D|商品價款欄 (5)|空格 (5) 位於 Amount 欄上方的交易條件位置；45A：CIF CHENNAI INCOTERMS 2010；發票 To 欄印的是 XXX，不是 (5)。
RULE:ISBP745 C8|D|交易條件版本|信用狀把 Incoterms 來源及版本列入交易條件時，發票亦須記載相同來源，不能只留下港口與 CIF。
[T62-8]
65·提單|ABCD|空格 (6)|位於 Consignee 收貨人欄。
63·46A|ABCD|指定抬頭|MADE OUT TO ORDER OF ORIENTAL BANK OF COMMERCE, MOUNT ROAD BRANCH。
63·50、46A|ABCD|通知人另有規定|NOTIFYING APPLICANT；Applicant 是 SUPERSTRONG CO.，此角色不要與 Consignee 混用。
RULE:ISBP745 E15|CD|銀行指示抬頭|信用狀要求以開狀銀行為指示人時，提單須具名記載銀行，不以 TO ORDER OF ISSUING/OPENING BANK 之泛稱取代。
[T62-9]
65·提單|ABCD|空格 (7)|在 Port of Discharge 欄；不是 Place of Receipt 或 Port of Loading。
63·44F|ABC|指定卸貨港|CHENNAI PORT, INDIA。
65·提單|BD|實際裝貨地點|Port of Loading：TAICHUNG, TAIWAN。
65·提單、63·44E|BD|收貨地與准許裝港|Place of Receipt：TAICHUNG, TAIWAN；44E：ANY PORT IN TAIWAN。
[T62-10]
65·提單|ABCD|空格 (8)|在 Peter Lee 簽名的下方，是簽署身分欄；不是上方 Shipper 欄。
65·提單|ABCD|公司名稱|表頭及簽名區均列 ABC LINE LIMITED。
63·46A|ABCD|要求的文件|FULL SET OF CLEAN ON BOARD BILLS OF LADING。
RULE:UCP600 20(a)(i)|ABCD|海運提單簽署身分|須由運送人、船長或其具名代理人適當簽署；代理人須說明代表誰。僅寫託運人或貨運承攬人身分，不等同具名運送人署名。
[T66-1]
68·40A|ABC|信用狀形式|IRREVOCABLE；本狀未列可轉讓或循環恢復金額條款。
68·41D|ABD|使用方式與銀行|AKBANK T.A.S. BY DEFERRED PAYMENT。
68·42P|BCD|付款條件|120 DAYS AFTER SHIPMENT。
68·49|D|保兌指示|WITHOUT。
[T66-2]
68·42P|ABCD|付款期限原文|120 DAYS AFTER SHIPMENT。
68·41D|ABCD|使用方式|AKBANK T.A.S. BY DEFERRED PAYMENT。
68·31C|ABCD|另列的開狀日期|190521；此欄不是 42P 所述的起算事件。
68·45A|ABCD|另列的交易文件日期|AS PER PROFORMA INVOICE NO. AIC-PL1010709 DATED 20/03/2019；該 P/I 日期與 SHIPMENT 是不同資料。
[T66-3]
68·41D、42P|A|付款安排|BY DEFERRED PAYMENT；42P：120 DAYS AFTER SHIPMENT；原狀未要求以匯票提示請款。
68·46A|B|產地證明書|CERTIFICATE OF ORIGIN ISSUED BY A COMPETENT AUTHORITY，證明 CHINESE ORIGIN。
68·46A|C|運送文件|FULL SET CLEAN ON BOARD BILLS OF LADING，TO THE ORDER AND BLANK ENDORSED。
68·46A|D|包裝單|PACKING LIST IN 4 ORIGINALS PLUS 4 COPIES；本項沒有指定出具人。
RULE:UCP600 3、14(f)、20(a)(i)|BCD|出具人通則|COMPETENT 一詞描述出具人時排除受益人；未指定出具人的其他文件依功能審查；提單須由運送人、船長或其合格代理人適當簽署。
[T66-4]
68·43P|A|分批裝運|NOT ALLOWED。
68·46A|B|投保比例原文|保險單要求 120 PERCENT OF THE CIF INVOICE VALUE；此處保留 120% 原文，不改寫成選項的「至少110%」。
68·41D|C|指定付款銀行|AKBANK T.A.S. BY DEFERRED PAYMENT。
68·48、31D|D|提示期間與到期日|WITHIN 21 DAYS AFTER SHIPMENT BUT WITHIN L/C VALIDITY；31D：190929 TAIWAN。
[T66-5]
68·46A|A|提單背書|ISSUED TO THE ORDER AND BLANK ENDORSED。
68·46A|B|發票簽署|SIGNED COMMERCIAL INVOICE IN 3 ORIGINALS AND 3 COPIES。
68·71B|C|銀行費用負擔|ALL BANKING CHARGES AND COMMISSIONS OUTSIDE TURKEY ARE FOR BENEFICIARY'S ACCOUNT。
68·72|D|電文效力|THIS MESSAGE IS AN OPERATIVE INSTRUMENT AND NO MAIL CONFIRMATION WILL FOLLOW。
[T66-6]
69·包裝單|ABCD|空格 (1)|位於 DATE 欄，是包裝單日期；不是裝船日期欄。
68·31C|AB|開狀日|190521（2019/05/21）。
68·44C|C|最後裝運日|190908（2019/09/08）。
68·31D、48|CD|信用狀期限|到期 190929（2019/09/29）；裝船後21日內提示，且仍須在信用狀效期內。
RULE:UCP600 14(i)|ABCD|文件日期通則|文件可早於開狀日，但不得晚於其提示日；仍須核對信用狀是否另設日期限制。
[T66-7]
69·包裝單|ABCD|空格 (2)|位於 FOR ACCOUNT & RISK OF MESSRS. 欄。
68·50|A|申請人|ABC INC., SABANCI CENTER 4 LEVENT 34330, ISTANBUL, TURKEY。
68·59|B|受益人|XYZ TRADING CO., LTD., NO.123, SEC.2, TUN-HWA SOUTH ROAD, TAIPEI, TAIWAN, R.O.C.。
68·45A、41D|CD|貨名及銀行另有欄位|45A：TIRES AS PER PROFORMA INVOICE NO. AIC-PL1010709 DATED 20/03/2019；41D：AKBANK T.A.S.。
[T67-8]
70·提單|ABCD|空格 (3)|位於 Shipper 欄；空格 (4) 才是 Consignee。
68·47A|ABCD|託運人特別限制|ALL DOCUMENTS EXCEPT FOR THE CERTIFICATE OF ORIGIN MUST SHOW BENEFICIARY AS SHIPPER/EXPORTER。
68·59|B|受益人名稱及地址|XYZ TRADING CO., LTD., NO.123, SEC.2, TUN-HWA SOUTH ROAD, TAIPEI, TAIWAN, R.O.C.。
68·50、41D、45A|ACD|其他角色|Applicant：ABC INC.；指定銀行：AKBANK T.A.S.；Goods：TIRES AS PER PROFORMA INVOICE。這些與 Beneficiary 分欄記載。
[T67-9]
70·提單|ABCD|空格 (4)|位於 Consignee 欄；不是 Shipper (3)。
68·46A|ABCD|提單抬頭原文|ISSUED TO THE ORDER AND BLANK ENDORSED；本段沒有指定銀行或申請人為抬頭。
68·50、59|AB|交易雙方|Applicant：ABC INC.；Beneficiary：XYZ TRADING CO., LTD.。
68·41D|C|指定付款銀行|AKBANK T.A.S. BY DEFERRED PAYMENT；此為使用銀行欄，與46A的提單抬頭分開。
[T67-10]
70·提單|ABCD|空格 (5)|位於 Port of Discharge；Port of Loading 是另一欄。
68·44F|ABCD|指定卸貨港|ISTANBUL, TURKEY。
68·44E|ACD|准許裝貨港|ANY PORT IN CHINA。
69·包裝單嘜頭|ABCD|原單據地點文字|嘜頭列 ISTANBUL、C/NO.1-300、MADE IN CHINA；分別涉及目的地、箱號及原產地，勿混為一欄。
[T71-1]
73·40A|ABCD|信用狀形式|IRREVOCABLE；原狀沒有 TRANSFERABLE 授權文字。
73·41A|CD|使用方式|ADVISING BANK BY ACCEPTANCE。
73·42C|CD|匯票期限|90 DAYS AFTER SIGHT FOR FULL INVOICE VALUE。
73·49|AB|保兌指示|MAY ADD；原附件未附銀行已加具保兌的承諾。
RULE:UCP600 8(b)、38(b)|ABD|保兌與轉讓通則|保兌責任以實際加具保兌為準；可轉讓信用狀須明確表明 transferable。授權與已完成的行為不可混同。
[T71-2]
73·46A|A|發票要求|COMMERCIAL INVOICE IN 3 COPIES INDICATING "THE MACHINES ARE UNUSED"；本段未要求 SIGNED。
73·47A|B|P/I 記載要求|COMMERCIAL INVOICE SHOULD BEAR THE NUMBER OF P/I；另要求所有提示文件載明信用狀號碼及日期，P/I 與 L/C 是不同文件編號。
73·47A、59|C|託運人限制|SHIPPER OTHER THAN THE BENEFICIARY IS NOT ACCEPTABLE；59：HIRICH MACHINE TOOL CO., LTD.。
73·46A|D|產地證明書|證明 TAIWAN ORIGIN，並由 THE LOCAL CHAMBER OF COMMERCE IN EXPORTING COUNTRY 出具。
[T71-3]
75·提單|ABCD|實際裝船日|Shipped on Board Date：OCT. 22, 2020；提單簽發日亦為 OCT. 22, 2020。
73·48|ABCD|本狀提示期間|ALL DOCUMENTS TO BE PRESENTED WITHIN 7 DAYS AFTER THE SHIPMENT DATE。
73·31D|ABCD|信用狀到期日|201105 TAIWAN（2020/11/05）。
73·44C|ABCD|最遲裝運日|201029（2020/10/29）；這與提單上的實際裝船日是不同欄位。
[T71-4]
73·45A|ABC|商品名稱與第一型號|MILLING MACHINE；HK-GV3：1 UNIT。
73·45A|ABC|第二型號與數量|HK-HV3：4 UNITS；與第一型號合計5部。
73·46A|D|貨物狀態|發票必須載明 THE MACHINES ARE UNUSED。
RULE:UCP600 14(e)|ABCD|提單貨名通則|商業發票以外的單據可使用概括貨名，但不得與信用狀的商品描述相牴觸。
[T71-5]
73·31C、47A|AB|開狀日及文件日期限制|31C：200925（2020/09/25）；DOCUMENTS DATED BEFORE THE ISSUING DATE OF THIS CREDIT ARE NOT ALLOWED。
75·提單|AC|實際裝船日|Shipped on Board Date：OCT. 22, 2020。
73·46A|C|受益人聲明內容|須證明 SHIPMENT DETAILS HAVE BEEN FAXED TO THE APPLICANT ON SHIPPING DATE。
73·46A、75·提單|D|要求的正本套數|46A 要求 FULL SET；原提單 Number of Original B/Ls：FOUR (4)。
RULE:UCP600 14(i)、ISBP745 C10|A|發票日期通則|並無一律須在裝船後才簽發發票的規定；仍須遵守信用狀的日期限制，且文件日期不得晚於提示日。
[T71-6]
74·發票|ABCD|兩個空格的位置|Shipped Per (1)；To (2)。
75·提單|ABCD|船名及航次分欄原文|Ocean Vessel：KMARIN ATLANTICA；Voy. No.：06Y7AW1MB。
75·提單|ABCD|實際卸貨港|Port of Discharge：AMBARLI PORT。
73·44F、75·提單|ABCD|准許港口與實際港口|44F 僅列 ANY PORT IN TURKEY；提單另列實際港名，並把 Ocean Vessel 與 Voy. No. 分欄，未預印合併的船名航次寫法。
[T71-7]
74·發票|ABCD|空格 (3)|位於 Amount 欄上方，為交易價格條件位置。
73·45A|ABCD|信用狀交易條件|FOB ANY PORT IN TAIWAN INCOTERMS 2020。
75·提單|ABCD|本批實際裝貨港|Port of Loading：TAICHUNG。
RULE:ISBP745 C8|ABCD|發票條件核對|發票須反映信用狀列明的貿易條件及版本；實際裝港則依本批運送資料核對。
[T72-8]
74·發票|ABCD|空格 (4) 所在句子|THE GOODS ARE OF (4) ORIGIN。
73·47A|ABCD|發票原產地要求|STATE THAT THE GOODS ARE OF TAIWAN ORIGIN。
73·46A|ABCD|產地證明要求|產地證明書須證明 TAIWAN ORIGIN，由 THE LOCAL CHAMBER OF COMMERCE IN EXPORTING COUNTRY 出具。
73·50、59|ABCD|交易雙方所在地|Applicant 在 ISTANBUL, TURKEY；Beneficiary 在 TAICHUNG CITY, TAIWAN。城市、國家、原產地是不同資料。
[T72-9]
75·提單|ABCD|空格 (5)|位於 Consignee 欄。
73·46A|ABCD|提單抬頭要求|BILLS OF LADING, MADE OUT TO OUR ORDER。
73·電文表頭|BCD|開狀方與收訊方|Sender：TURKIYE IS BANKASI A.S.；Receiver：MEGA INTERNATIONAL COMMERCIAL BANK CO., FENG YUAN BRANCH。
73·59|A|受益人另有名稱|HIRICH MACHINE TOOL CO., LTD.。
RULE:ISBP745 E15|BC|OUR ORDER 的記載|要求 TO OUR ORDER／TO ORDER OF ISSUING BANK 時，提單須列具名開狀銀行，而非原樣抄寫代名詞或銀行泛稱。
[T72-10]
75·提單|ABCD|空格 (6)|原欄印為 FREIGHT (6)，屬運費標示。
73·46A|ABCD|運費原文|MARKED "FREIGHT PAYABLE AT DESTINATION"。
73·45A|ABCD|交易條件|FOB ANY PORT IN TAIWAN INCOTERMS 2020。
75·提單|D|本批裝卸貨港|Port of Loading：TAICHUNG；Port of Discharge：AMBARLI PORT；裝貨地與目的地不可混用。
[T76-1]
78·42A、78|AC|開狀方資料|Drawee：US (SHINHAN BANK, SEOUL)；寄單指示亦指定 SHINHAN BANK, SEOUL。
78·57A|ACD|通知途徑銀行|BANK OF TAIWAN, TAICHUNG BRANCH。
78·41A|B|讓購安排|ADVISING BANK BY NEGOTIATION。
78·47A|D|轉讓授權|THIS CREDIT IS TRANSFERABLE THROUGH THE ADVISING BANK。
[T76-2]
78·46A、RULE:UCP600 18(a)(i)|B|發票出具人|本狀要求 SIGNED COMMERCIAL INVOICE；補充通則：商業發票須顯示由受益人出具（轉讓信用狀另依規定）。
78·46A|D|品質證明書|CERTIFICATE OF QUALITY ISSUED BY BENEFICIARY。
78·46A、RULE:UCP600 14(f)|C|包裝單出具人|本狀僅列 PACKING LIST IN DUPLICATE，未指定出具人；補充通則：其他文件未指定出具人時，依其功能及符合性審查。
RULE:UCP600 2|A|匯票出票人|信用狀規則對承兌的定義提到受益人所簽發的匯票；請與匯票付款人、受款銀行區分。
[T76-3]
78·40A|AB|信用狀形式|IRREVOCABLE。
78·41A|CD|使用方式|ADVISING BANK BY NEGOTIATION。
78·47A|BCD|轉讓條款|THIS CREDIT IS TRANSFERABLE THROUGH THE ADVISING BANK。
78·49、RULE:UCP600 8(b)|A|保兌指示|MAY ADD；補充：授權可加保兌，不等於附件已證明銀行實際加具保兌。
[T76-4]
80·提單|ABCD|實際裝船日|Shipped on Board Date：JULY 21, 2025。
80·提單|ABCD|提單簽發日|Place / Date of Issue：TAICHUNG / JULY 22, 2025；與裝船日不同。
78·48|ABCD|提示期間|WITHIN 10 DAYS AFTER SHIPMENT DATE BUT WITHIN THE VALIDITY OF THIS CREDIT。
78·31D|ABCD|信用狀到期日|250730 TAIWAN（2025/07/30）。
78·44C|ABCD|最遲裝運日|250722（2025/07/22）；不可用此日取代實際裝船日。
[T76-5]
78·46A|A|提單抬頭|FULL SET (4/4) OF CLEAN ON BOARD BILLS OF LADING, MADE OUT TO OUR ORDER。
79·匯票|B|匯票份數文字|THIS FIRST OF EXCHANGE；括號中另有 SECOND OF THE SAME TENOR AND DATE BEING UNPAID。
78·46A|C|保險理賠地|CLAIMS PAYABLE IN KOREA。
78·46A|D|產地證明書出具人|CERTIFICATE OF ORIGIN ISSUED BY THE CHAMBER OF COMMERCE。
[T76-6]
79·匯票|ABCD|兩個空格位置|TO (1) 在左下付款人欄；(2) 在右下 Tom Lee 簽名上方。Pay to the order of 與 Issued by 原欄均印 XXX，並非 (1)(2)。
78·42A|ABCD|匯票付款人|US (SHINHAN BANK, SEOUL)。
78·59、50|ABCD|受益人與申請人|Beneficiary：GLORY INTERNATIONAL CO., LTD.；Applicant：SUNSHINE CO., LTD.。
78·57A|CD|另列通知銀行|BANK OF TAIWAN, TAICHUNG BRANCH。
[T76-7]
79·發票|ABCD|空格位置|Shipped per (3)；From (4)；AS PER (5) GI-254468；GOODS ARE OF (6) ORIGIN。
80·提單|A|船名及航次|Vessel：EVER CAST；Voyage No.：0089-091N。
80·提單|B|實際裝貨港|Port of Loading：TAICHUNG。
78·45A、47A|C|P/I 核對資料|AS PER P/I NO. GI-254468 DATED APR.22,2025；發票須列 P/I 號碼與日期，不是發票自身號碼。
78·46A|D|發票原產地要求|SIGNED COMMERCIAL INVOICE … CERTIFYING THAT GOODS ARE OF TAIWAN ORIGIN。
[T77-8]
79·發票|ABCD|空格 (7)|位於 Amount 欄上方，屬交易價格條件欄。
78·45A|ABCD|信用狀價格條件|CIF BUSAN, KOREA (INCOTERMS 2020)。
80·提單|ABCD|本批實際卸貨港|Port of Discharge：BUSAN, KOREA。
RULE:ISBP745 C8|ABCD|版本核對|信用狀已列貿易條件來源與版本時，發票亦須記載相同來源及版本，不可自行改成另一年度。
[T77-9]
80·提單|ABCD|空格 (8)|位於 Consignee 欄。
78·46A|ABCD|提單抬頭要求|BILLS OF LADING, MADE OUT TO OUR ORDER。
78·42A、78|D|OUR 所指銀行|Drawee：US (SHINHAN BANK, SEOUL)；寄單指示亦指定該銀行。
RULE:ISBP745 E15|ABCD|抬頭記載通則|信用狀要求 TO OUR ORDER 時，提單應列具名開狀銀行；不是把 OUR 原樣抄入，也不是自動指向 Shipper。
[T77-10]
80·提單|ABCD|空格 (9) 與 (10)|(9) 為貨物欄中的運費標示；(10) 在 Number of Original B/Ls 欄，表示提單正本份數。
78·46A|ABCD|正本套數要求|FULL SET (4/4) OF CLEAN ON BOARD BILLS OF LADING。
78·46A|ABCD|運費標示要求|MARKED "FREIGHT PREPAID"。
78·45A|ABCD|原信用狀交易條件|CIF BUSAN, KOREA (INCOTERMS 2020)。
`;
  const points = Object.create(null);
  let id = null;
  for (const line of definitions.trim().split('\n')) {
    if (line.startsWith('[')) { id=line.slice(1,-1); points[id]=[]; continue; }
    const [source,covers,title,...rest] = line.split('|');
    points[id].push(Object.freeze({source,covers,title,text:rest.join('|')}));
  }
  for (const id of Object.keys(points)) Object.freeze(points[id]);
  Object.freeze(points);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function validate(bank) {
    const lc=bank.filter(q => q.chapterId==='T12');
    if(lc.length!==50 || Object.keys(points).length!==50) throw Error('Expected 50 LC summaries');
    for(const q of lc){
      const ps=points[q.id];
      if(!ps || ps.length<4 || ps.length>5) throw Error('Expected 4–5 points: '+q.id);
      for(const a of 'ABCD') if(!ps.some(p=>p.covers.includes(a))) throw Error('Missing choice source: '+q.id+'/'+a);
      if(ps.some(p=>!p.source||!p.title||!p.text)) throw Error('Incomplete point: '+q.id);
    }
    return true;
  }
  function render(id) {
    const ps=points[id];
    if(!ps) return '';
    return '<div class="lc-front-summary" data-front-id="'+esc(id)+'" data-front-version="'+VERSION+'">'+
      '<h3>作答前的 '+ps.length+' 點判斷資料</h3>'+
      '<p class="lc-front-intro">先核對下列文字，再判斷四個選項；原始文件保留在下方。</p>'+
      '<ol class="lc-front-list">'+ps.map((p,i)=>{
        const supplement=p.source.includes('RULE:');
        const source=p.source.replace(/RULE:/g,'補充規則：');
        return '<li data-point="'+(i+1)+'"><strong>'+esc(p.title)+'</strong><p>'+esc(p.text)+'</p>'+
          '<small class="lc-front-source">'+(supplement?'來源／補充：':'原題庫 PDF：')+esc(source)+
          (supplement?'（規則摘要非附件原文）':' 頁／欄位')+'</small></li>';
      }).join('')+'</ol></div>';
  }
  function resolveQuestion(block, root) {
    const review=block.closest('.review');
    const paragraphs=Array.from((review||root).children).filter(n=>n.tagName==='P');
    for(const node of paragraphs){
      const m=node.textContent.match(/原題[：:\s]+(T\d+-\d+)/);
      if(m && points[m[1]]) return m[1];
    }
    return null;
  }
  function install(doc) {
    const root=doc.getElementById('app');
    if(!root || root.dataset.lcFrontInstalled===VERSION) return;
    root.dataset.lcFrontInstalled=VERSION;
    const style=doc.createElement('style');
    style.id='lc-front-summary-style';
    style.textContent=`
.lc-front-summary h3{font-size:1.05rem;line-height:1.5;color:#244c69;margin:0 0 7px}
.lc-front-intro{font-size:.83rem;color:#4e697d;line-height:1.6;margin:4px 0 12px}
.lc-front-list{margin:0;padding:0;list-style:none;counter-reset:lc-source;display:grid;gap:9px}
.lc-front-list>li{counter-increment:lc-source;position:relative;padding:12px 12px 10px 38px;border:1px solid #cddfe9;border-radius:10px;background:#fff;min-width:0}
.lc-front-list>li::before{content:counter(lc-source);position:absolute;left:11px;top:12px;font-weight:750;color:#2e5d7c;font-size:.95rem}
.lc-front-list strong{display:block;line-height:1.45;font-size:.92rem;color:#204865}
.lc-front-list p{font-size:.97rem;line-height:1.65;margin:5px 0;white-space:pre-wrap;overflow-wrap:anywhere;color:#213a4c}
.lc-front-source{display:block;font-size:.73rem;color:#506b80;line-height:1.5;overflow-wrap:anywhere}
.lc-front-documents-heading{font-size:.89rem;color:#3b627e;margin:17px 0 5px}
@media(max-width:640px){.lc-front-list>li{padding:11px 9px 10px 34px}.lc-front-list>li::before{left:10px}.lc-front-list p{font-size:.96rem}.lc-front-summary h3{font-size:1.03rem}}
`;
    doc.head.appendChild(style);
    function enhance() {
      for(const block of root.querySelectorAll('.lc-doc-review')){
        if(block.dataset.frontVersion===VERSION) continue;
        const id=resolveQuestion(block,root);
        if(!id) continue;
        const markup=render(id);
        if(!markup) continue;
        // Move existing image nodes: this preserves their tested click/zoom handlers.
        // The first 4–5 points remain visible even when images are unavailable.
        const originalNodes=Array.from(block.children).filter(n=>
          n.classList.contains('lc-image-grid')||n.classList.contains('lc-optional-images')||n.classList.contains('lc-original-full'));
        const fragment=doc.createElement('div');fragment.innerHTML=markup;
        const heading=doc.createElement('p');heading.className='lc-front-documents-heading';heading.textContent='原始附件與完整信用狀（核對用）';
        block.dataset.frontVersion=VERSION;
        block.replaceChildren(fragment.firstElementChild,heading,...originalNodes);
      }
    }
    const observer=new MutationObserver(enhance);
    observer.observe(root,{childList:true,subtree:true});
    enhance();
  }
  return Object.freeze({VERSION,points,validate,render,resolveQuestion,install});
});
