var dataArray = new Array();
var g_currentDataId = -1;

function clearData()
{
	while (dataArray.length > 0)
		dataArray.shift();
}

function testArray()
{
	clearData();
	alert("data length : " + dataArray.length);
	for (var i = 0; i < 10; i++)
	{
		var objData = {name: 1, 
			srcIp: "192.168.1.150", 
			tarType: "tcp", 
			tarIp: "192.168.1.150",
			tarPort: 5678,
			srcData: "0x01 0x02 0x03 0x04 0x05 0x06",
			tarData: "0x01 0x02 0x03 0x04 0x05 0x06"};
		objData.name = i;
		dataArray[i] = objData;
	}

	for (var i = 0; i < 10; i++)
	{
		var objData = {name: 1, 
			srcIp: "192.168.1.150", 
			tarType: "tcp", 
			tarIp: "192.168.1.150",
			tarPort: 5678,
			srcData: "0x01 0x02 0x03 0x04 0x05 0x06",
			tarData: "0x01 0x02 0x03 0x04 0x05 0x06"};
		objData.name = i;
	}
}

function dataManage_loadEvent()
{
	if (!document.getElementById)
		return false;	

	var aNode = document.getElementById("saveData");
	if (!aNode)
		return false;

	aNode.onclick = function() {
		saveData();
		return false;
	}

	readTermioParas();
}

function saveData()
{
	//请求
	var xmlhttp = getHttp();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			if (xmlhttp.responseText == 1) {
				for (var i = 0; i < dataArray.length; i++) {
					if (!checkObjData(dataArray[i]))
						continue;

					var str = "data=" + genTransDataFromObj(dataArray[i]);
					appendDataToSvr(str, i);
					break;
				}
			}
		}
	}

	xmlhttp.open("GET","/cgi-bin/clearDataTrans.cgi", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
	xmlhttp.send();

	return true;
}

function appendDataToSvr(strData, index)
{
	var xmlhttp = getHttp();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			if (xmlhttp.responseText == 1) {
				//save next data
				for (var i = index + 1; i < dataArray.length; i++) {
					if (!checkObjData(dataArray[i]))
						continue;

					var str = "data=" + genTransDataFromObj(dataArray[i]);
					appendDataToSvr(str, i);
					break;
				}

				if (i >= dataArray.length)
					alert("Save data successfully!");
			}
		}
	}

	xmlhttp.open("POST","/cgi-bin/appendDataTrans.cgi", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
	xmlhttp.send(strData);

	return true;
}

/*
object {name: 1, 
srcIp: "192.168.1.150", 
tarType: "tcp", 
tarIp: "192.168.1.150",
tarPort: 5678,
srcData: "0x01 0x02 0x03 0x04 0x05 0x06",
tarData: "0x01 0x02 0x03 0x04 0x05 0x06"}
*/
function checkObjData(objData)
{
	if (objData.name == "")
		return false;

	if (objData.srcIp == "")
		return false;

	if (objData.tarType != "tcp" &&
		objData.tarType != "udp" &&
		objData.tarType != "com2" &&
		objData.tarType != "com3" &&
		objData.tarType != "com4")
		return false;

	if (objData.tarType == "tcp" ||
		objData.tarType == "udp") {
		if (objData.tarIp == "")
			return false;

		if (objData.tarPort == "")
			return false;
	}

	return true;
}

//由数据对象生成要存储的字符格式
//1:tcp 192.168.1.158:tcp 192.168.1.158 5678:0x01 0x02:0x57 0x08 0x09 0x0a 0x0b 0x0c
function genTransDataFromObj(objData)
{
	var retStr;
	retStr = objData.name + ":tcp " + objData.srcIp + ":";
	if (objData.tarType == "tcp" || objData.tarType == "udp") {
		retStr += objData.tarType + " " + objData.tarIp + " " + objData.tarPort;
	}
	else
		retStr += objData.tarType;

	retStr += ":" + objData.srcData + ":" + objData.tarData;

	return retStr;
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

			//解析 xml 数据，并保存到 dataArray
			updateData(rsp);

			//更新界面
			updateUIData();
			updateMainUI();
		}
	}

	xmlhttp.open("GET","/cgi-bin/readDataTrans.cgi", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
	xmlhttp.send();

	return true;
}

/*更新数据*/
function updateData(xmlRsp)
{
	if (!document.getElementsByTagName)
		return false;

	clearData();
	
	var dataNodes = xmlRsp.documentElement.getElementsByTagName("data");
	if (!dataNodes || dataNodes.length == 0)
		return false;

    for (var i = 0; i < dataNodes.length; i++) {
		var objData = {name: 1, 
			srcIp: "192.168.1.150", 
			tarType: "tcp", 
			tarIp: "192.168.1.150",
			tarPort: 5678,
			srcData: "0x01 0x02 0x03 0x04 0x05 0x06",
			tarData: "0x01 0x02 0x03 0x04 0x05 0x06"};

		//name
		var name = getNodeText(dataNodes[i], "name", 0);
		if (!name) return false;
		objData.name = name;

		//srcIp
		var srcIp = getNodeText(dataNodes[i], "ip", 0);
		if (!srcIp) return false;
		objData.srcIp = srcIp;

		//tarType
		var tarType = getNodeText(dataNodes[i], "type", 0);
		if (!tarType) return false;
		objData.tarType = tarType;

        if (tarType == "tcp" || tarType == "udp") {
			//tarIp
			var tarIp = getNodeText(dataNodes[i], "ip", 1);
			if (!tarIp) return false;
			objData.tarIp = tarIp;

			//tarPort
			var tarPort = getNodeText(dataNodes[i], "port", 0);
			if (!tarPort) return false;
			objData.tarPort = tarPort;
        }		

		//srcData
		var srcData = getNodeText(dataNodes[i], "srcData", 0);
		if (!srcData) return false;
		objData.srcData = srcData;

		//tarData
		var tarData = getNodeText(dataNodes[i], "tarData", 0);
		if (!tarData) return false;
		objData.tarData = tarData;

		//append child
		dataArray.push(objData);
    }

	//index
	if (dataArray.length > 0)
		g_currentDataId = 0;
	else
		g_currentDataId = -1;	

	return true;
}

/*更新导航树的菜单项*/
function updateUIData()
{
	if (!document.getElementById)
		return false;

	clearUIData();

	var tarParent = document.getElementById("datalist");
	if (!tarParent)
		return false;

	for (var i = 0; i < dataArray.length; i++) {
		if (!appendTreeUI(dataArray[i].name))
			return false;
	}

	return true;
}

function appendTreeUI(newNodeName)
{
	if (!document.getElementById)
		return false;

	var tarParent = document.getElementById("datalist");
	if (!tarParent)
		return false;

	var liNode = document.createElement("li");
	if (!liNode)
		return false;
	liNode.setAttribute("class", "sublist");

	var aNode = document.createElement("a");
	if (!aNode)
		return false;

	aNode.setAttribute("href", "#");
	aNode.setAttribute("title", newNodeName);
	aNode.onclick = function() {
		selectData(this);
		return false;
	}

	var textNode = document.createTextNode(newNodeName);
	if (!textNode)
		return false;

	aNode.appendChild(textNode);
	liNode.appendChild(aNode);
	tarParent.appendChild(liNode);

	return true;
}

/*删除导航树的菜单项*/
function clearUIData()
{
	if (!document.getElementsByTagName)
		return false;

	if (!document.getElementById)
		return false;

	var tarParent = document.getElementById("datalist");
	if (!tarParent)
		return false;

	var datalist = tarParent.getElementsByTagName("li");
	while (datalist.length > 0)	
		tarParent.removeChild(datalist[datalist.length - 1]);

	return true;
}

/*更新数据操作界面*/
function updateMainUI()
{
	if (!document.getElementById)
		return false;

	if (g_currentDataId < 0)
		return clearMainUI();

	if (g_currentDataId >= dataArray.length)
		return false;

	var objData = dataArray[g_currentDataId];

	//name
	var nodeSelected = document.getElementById("objName");
	if (!nodeSelected) return false;
	nodeSelected.value = objData.name;

	//src ip
	nodeSelected = document.getElementById("srcIp");
	if (!nodeSelected) return false;
	nodeSelected.value = objData.srcIp;

	//srcData
	nodeSelected = document.getElementById("srcData");
	if (!nodeSelected) return false;
	nodeSelected.value = objData.srcData;

	//tarType
	nodeSelected = document.getElementById("termio");
	if (!nodeSelected) return false;
	for (var i = 0; i < nodeSelected.options.length; i++) {
		if (objData.tarType == nodeSelected.options[i].getAttribute("value")) {
			nodeSelected.options[i].selected = true;
			break;
		}
	}
    
	if (objData.tarType == "tcp" || objData.tarType == "udp") {
		//tarIp
		nodeSelected = document.getElementById("tarIp");
		if (!nodeSelected) return false;
		nodeSelected.value = objData.tarIp;

		//tarPort
		nodeSelected = document.getElementById("tarPort");
		if (!nodeSelected) return false;
		nodeSelected.value = objData.tarPort;
	}
	else {
		//tarIp
		nodeSelected = document.getElementById("tarIp");
		if (!nodeSelected) return false;
		nodeSelected.value = "";

		//tarPort
		nodeSelected = document.getElementById("tarPort");
		if (!nodeSelected) return false;
		nodeSelected.value = "";
	}
	
    //tarData
	nodeSelected = document.getElementById("tarData");
	if (!nodeSelected) return false;
	nodeSelected.value = objData.tarData;

	return true;
}

function clearMainUI()
{
	if (!document.getElementById)
		return false;

	//name
	var nodeSelected = document.getElementById("objName");
	if (!nodeSelected) return false;
	nodeSelected.value = "";
	
	//src ip
	nodeSelected = document.getElementById("srcIp");
	if (!nodeSelected) return false;
	nodeSelected.value = "";

	//srcData
	nodeSelected = document.getElementById("srcData");
	if (!nodeSelected) return false;
	nodeSelected.value = "";

	//tarType
	nodeSelected = document.getElementById("termio");
	if (!nodeSelected) return false;
	nodeSelected.options[0].selected = true;
    
	//tarIp
	nodeSelected = document.getElementById("tarIp");
	if (!nodeSelected) return false;
	nodeSelected.value = "";

	//tarPort
	nodeSelected = document.getElementById("tarPort");
	if (!nodeSelected) return false;
	nodeSelected.value = "";
	
    //srcData
	nodeSelected = document.getElementById("tarData");
	if (!nodeSelected) return false;
	nodeSelected.value = "";

	return true;
}

function getNodeText(parent, tagName, index)
{
	if (!document.getElementsByTagName)
		return false;

	var nodeList = parent.getElementsByTagName(tagName);
	if (!nodeList || nodeList.length <= index)
		return false;

	return nodeList[index].firstChild.nodeValue;
}

function selectData(whichData)
{
	//取得dataName
	var dataName = whichData.getAttribute("title");

	//find index
	var index = findIndexByDataName(dataName);
	if (index < 0)
		return false;

	g_currentDataId = index;

	updateMainUI();
}

function findIndexByDataName(dataName)
{
	for (var i = 0; i < dataArray.length; i++) {
		if (dataArray[i].name == dataName)
			return i;
	}

	return -1;
}

function addData()
{
	var objData = {name: 1, 
			srcIp: "", 
			tarType: "", 
			tarIp: "",
			tarPort: 0,
			srcData: "",
			tarData: ""};

	//name
	var name = findNewDataName();
	objData.name = name;		

	//update data
	dataArray.push(objData);
	g_currentDataId = dataArray.length - 1;

	//add tree UI
	appendTreeUI(name);
	updateMainUI();
}

function findNewDataName()
{
	var i = 1;
	var retName = "data" + i;

	while (findIndexByDataName(retName) >= 0) {
		i++;
		retName = "data" + i;
	}

	return retName;
}

function deleteSelData()
{
	if (g_currentDataId < 0)
		return false;

	//data update
	if (g_currentDataId >= dataArray.length)
		return false;
	dataArray.splice(g_currentDataId, 1);
	if (g_currentDataId >= dataArray.length)
		g_currentDataId = -1;

	//更新界面
	updateUIData();
	updateMainUI();

	return false;
}

function updateSelData()
{
	if (!document.getElementById)
		return false;

	if (g_currentDataId < 0 || g_currentDataId >= dataArray.length)
		return false;

	var objData = dataArray[g_currentDataId];

	//save 
	//name
	var nodeSelected = document.getElementById("objName");
	if (!nodeSelected) return false;
	objData.name = nodeSelected.value;

	//src ip
	nodeSelected = document.getElementById("srcIp");
	if (!nodeSelected) return false;
	objData.srcIp = nodeSelected.value;

	//srcData
	nodeSelected = document.getElementById("srcData");
	if (!nodeSelected) return false;
	objData.srcData = nodeSelected.value;

	//tarType
	nodeSelected = document.getElementById("termio");
	if (!nodeSelected) return false;
	for (var i = 0; i < nodeSelected.options.length; i++) {
		if (nodeSelected.options[i].selected) {
			objData.tarType = nodeSelected.options[i].getAttribute("value");
			break;
		}
	}
    
	if (objData.tarType == "tcp" || objData.tarType == "udp") {
		//tarIp
		nodeSelected = document.getElementById("tarIp");
		if (!nodeSelected) return false;
		objData.tarIp = nodeSelected.value;

		//tarPort
		nodeSelected = document.getElementById("tarPort");
		if (!nodeSelected) return false;
		objData.tarPort = nodeSelected.value;
	}
	else {
		//tarIp
		objData.tarIp = "";
		objData.tarPort = "";
	}
	
    //tarData
	nodeSelected = document.getElementById("tarData");
	if (!nodeSelected) return false;
	objData.tarData = nodeSelected.value;

	updateUIData();

	alert("update success");

	return true;
}

addEvent(dataManage_loadEvent);
