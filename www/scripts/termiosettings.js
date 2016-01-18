function termiosettings_loadEvent()
{
	readTermioParas();
}

function readTermioParas()
{
	if (!document.getElementsByTagName)
		return false;

	if (!document.getElementById)
		return false;

	//请求
	var xmlhttp = getHttp();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			var rsp = xmlhttp.responseXML;
			//解析 xml 数据，并更新界面

			//tcp
			var tcpNodes = rsp.documentElement.getElementsByTagName("tcp");
			if (!tcpNodes)
				return false;

			var portNodes = tcpNodes[0].getElementsByTagName("port");
			if (!portNodes)
				return false;

			var portText = portNodes[0].firstChild.nodeValue;

			var tcpport = document.getElementById("tcpport");
			if (!tcpport)
				return false;

			tcpport.setAttribute("value", portText);

			//com
			setComData(rsp, "com2");	
			setComData(rsp, "com3");	
			setComData(rsp, "com4");	
		}
	}

	xmlhttp.open("GET","/cgi-bin/readTermioParas.cgi", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
	xmlhttp.send();
}

function setComData(xmlRsp, comName)
{
	if (!document.getElementsByTagName)
		return false;

	if (!document.getElementById)
		return false;

	//com
	var comNodes = xmlRsp.documentElement.getElementsByTagName(comName);
	if (!comNodes || comNodes.length == 0)
		return false;

    //baud
	var bauds = comNodes[0].getElementsByTagName("baud");
	if (!bauds || bauds.length == 0)
		return false;

	var boauText = bauds[0].firstChild.nodeValue;
	var comBaudId = comName + "Baud";
	var comBaud = document.getElementById(comBaudId);
	if (!comBaud)
		return false;

	comBaud.setAttribute("value", boauText);

    //databit
	var databits = comNodes[0].getElementsByTagName("databit");
	if (!databits || databits.length == 0)
		return false;

	var databitText = databits[0].firstChild.nodeValue;
	var comDatabitId = comName + "Databit";
	var comDatabit = document.getElementById(comDatabitId);
	if (!comDatabit)
		return false;

	comDatabit.setAttribute("value", databitText);

    //stopbit
	var stopbits = comNodes[0].getElementsByTagName("stopbit");
	if (!stopbits || stopbits.length == 0)
		return false;

	var stopbitText = stopbits[0].firstChild.nodeValue;
	var comStopbitId = comName + "Stopbit";
	var comStopbit = document.getElementById(comStopbitId);
	if (!comStopbit)
		return false;

	comStopbit.setAttribute("value", stopbitText);

	//validate
	var validatebits = comNodes[0].getElementsByTagName("validatebit");
	if (!validatebits || validatebits.length == 0)
		return false;

	var validateText = validatebits[0].firstChild.nodeValue;
	var comValidatebitId = comName + "Validatebit";
	var comValidatebit = document.getElementById(comValidatebitId);
	if (!comValidatebit)
		return false;

	comValidatebit.setAttribute("value", validateText);
}

function termioUpdate()
{
	if (!document.getElementById)
		return false;

	//请求
	var xmlhttp = getHttp();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			var rsp = xmlhttp.responseText;
			alert(rsp);
		}
	}

	//send info
	var strTcpValue;

	var tcpport = document.getElementById("tcpport");
	if (!tcpport)
		return false;

	var portText = tcpport.value;
	strTcpValue = "tcp=" + "tcp:" + portText;

	//com2
	var strCom2Value = getComParaText("com2");
	var strCom3Value = getComParaText("com3");
	var strCom4Value = getComParaText("com4");

	var str = strTcpValue + "&" + strCom2Value + "&" + 
		strCom3Value + "&" + strCom4Value;

	xmlhttp.open("POST","/cgi-bin/writeTermioParas.cgi", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
	xmlhttp.send(str);
}

function getComParaText(comName)
{
	if (!document.getElementById)
		return false;

	//baud
	var comBaudId = comName + "Baud";
	var comBaud = document.getElementById(comBaudId);
	if (!comBaud)
		return false;

	var boauText = comBaud.value;

	//databit
	var comDatabitId = comName + "Databit";
	var comDatabit = document.getElementById(comDatabitId);
	if (!comDatabit)
		return false;

	var databitText = comDatabit.value;

	//stopbit
	var comStopbitId = comName + "Stopbit";
	var comStopbit = document.getElementById(comStopbitId);
	if (!comStopbit)
		return false;

	var stopbitText = comStopbit.value;

	//validatebit
	var comValidatebitId = comName + "Validatebit";
	var comValidatebit = document.getElementById(comValidatebitId);
	if (!comValidatebit)
		return false;

	var validateText = comValidatebit.value;

	var retText;
	retText = comName + "=" + comName + ":" + boauText + ":" 
		+ databitText + ":" + stopbitText + ":" + validateText;

	return retText;
}

addEvent(termiosettings_loadEvent);	
