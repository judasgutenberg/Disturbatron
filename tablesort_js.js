//using an HTML table as a limited database table, will sort rows by the column specified
//Judas Gutenberg Dec 04 2007
//NOTE: altered Aug 2019 to store last sort and allows it to be re-run in cases where a refresh-like AJAX operation has happened
//to use:  first set the id of your table to sort to "idsorttable"
//second call  NumberRows(intTDMinCount) (where intTDMinCount is the minimum number of columns for a table row to be in play)
//that will set consecutive ids for all the TR nodes in the table whose ID is idsorttable
//then create hyperlinks on the headings of the HTML table columns 
//something like <a href=\"javascript: SortTable(3, 2)\">foreign PK</a>"
//which is labeled "foreign PK" and will, if clicked, sort column 3 (these columns are zero-based) starting with row #2
//This code is covered under the GNU General Public License
//info here: http://www.gnu.org/copyleft/gpl.html
//the digest is as follows: you cannot modify this code without
//publishing your source code under the same license
//contact the developer at gus@asecular.com  http://asecular.com

var arrDirection = new Array(); //stores global sort directions for the columns so they can be reversed with next click
var bwlsortable = false;
var lastSort = new Array(); //so we can redo old sorts
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}
 
function GetParent(thisnode)
{
	var thisparent;
	if(thisnode)
	{
		if (thisnode.parentNode)
		{
			thisparent=thisnode.parentNode
		}
		else
		{
			thisparent=thisnode.parentElement
		}
	
		return (thisparent);
	}
}

function NumberRows(idsorttable, intTDMinCount)
{
	//console.log("YEEE");
	var strDirection = '';
	var idprefix=idsorttable + 'idrow';
	var thistable=document.getElementById(idsorttable);
	var arrTRs=document.getElementsByTagName('tr');
	var intTRCount=0;
	var intsortable=0;
	//alert( arrTRs.length);
	for(i=0; i<arrTRs.length; i++)
	{
		thistr=arrTRs[i];
		var thesechildren=thistr.childNodes;
		//console.log(thesechildren);
		var tdcount=0;
		strDirection="";
		var bwlSubsidiary=false;
		var  bwlSortAvoid=false;
		
		//by naming a tr "sortavoid" it always avoids being sorted
		//also, any tr with fewer td cells than intTDMinCount will not be sorted
		var trname=thistr.getAttribute("name");
		var trclass=thistr.getAttribute("class");
		bwlHeaderFail=false;
		if(trname)
		{
			if(trname.indexOf("sortavoid")>-1 || trclass.indexOf("sortavoid")>-1)
			{
				//alert("#");
				bwlHeaderFail=true;
				bwlSortAvoid=true;
			}
		}
		for(j=0; j<thesechildren.length; j++)
		{
			//console.log(j);
			var thischild=thesechildren[j];
			if (thischild.nodeName.toLowerCase()=="td")
			{
				
				if(thischild.colSpan)
				{
					
					//this might not be a perfect test for all tables
					//but generally a row with a colspan in a sortable nested table
					//belongs to its immediate parent and should ride along through the sort
					//this behavior can be overridden by naming the row with a string including "sortavoid"
					if(thischild.colSpan>1)
					{
						//alert("$$" + thischild.id + " " + thischild.colSpan);
						bwlSubsidiary=true;
					}
				}
				tdcount++;
				strDirection+="f ";
			}
			if (thischild.innerHTML)
			{
				
				if (thischild.innerHTML.indexOf("SortTable(")>-1)
				{
					bwlHeaderFail=true;
				}
			}
		}
		var NextTableUp=ClimbTreeToTagFromObj(thistr, "table");
		//console.log(NextTableUp, thistable);
		if (NextTableUp.id==thistable.id )
		{
			
			if(bwlSubsidiary && !bwlSortAvoid )
			{
				thistr.id=idprefix + (intTRCount-1) + "_sub";
			}
			else if(tdcount>intTDMinCount && !bwlHeaderFail )
			{
				intsortable++;
				thistr.id=idprefix + intTRCount;
			}
			else
			{
				thistr.id=idprefix +  "x" + intTRCount;
			}
			intTRCount++;
		}
		else
		{
		 
			//idNextTableUp=NextTableUp.id;
			//if(idNextTableUp.indexOf("sorttable")>0)
		
		}
	}
	arrDirection=strDirection.split(" ");
	//alert(intsortable);
	if(intsortable>1)
	{
		bwlsortable=true;
	}
}

function redoLastSort(tableId) {
	if(!tableId) {
		tableId = lastSort[0];
	}
	//console.log(tableId, lastSort[1], lastSort[2]);
	SortTable(tableId, lastSort[1], lastSort[2], lastSort[3]);
}
 
function SortTable(idsorttable, intColumn, intStart, direction)
{
	if(bwlsortable)//i've turned off this functionality if the number of sortable rows is less than 2
	{
		var out="";
		var i;
		var j;
		if(!direction) {
			direction =  arrDirection[intColumn];
 		}
		lastSort = [idsorttable, intColumn, intStart, direction]; //save in a global in case we want to redo;
		var arrContainer=CreateColumnArray(idsorttable, intColumn, 0, direction);
		var idprefix=idsorttable + "idrow";
		var sortcontainer=document.createElement('tbody');  //for IE this has to be tbody.
		var strClass1="", strClass2="" ;
		//var idsorttable="idsorttable";
		var thistable=document.getElementById(idsorttable);
		var thistbody=document.getElementById(idsorttable + "body");
		if(intStart==undefined || intStart=="")
		{
			intStart=1;
		}
		if(arrDirection[intColumn]=="b")
		{
			if(direction = "b") {
				arrDirection[intColumn]="f";
			} else {
				arrDirection[intColumn]="b";
			}
		}
		else
		{
			if(direction = "b") {
				arrDirection[intColumn]="b";
			} else {
				arrDirection[intColumn]="f";
			}
		}
		//beginning rows that are not sorted
		for(i=0; i<4; i++)
		{
			var thisid=idprefix + "x" + i;
			var thistr=document.getElementById(thisid);
			
			if(thistr)
			{
				sortcontainer.appendChild(thistr);
			}
		}
		intMeatcount=0;
		for(i=0; i<arrContainer.length; i++)
		{
			if(arrContainer[i])
			{
				var arrTemp=arrContainer[i].split("^");
				var thisid=idprefix + arrTemp[1];
				//alert("meat: " +thisid  + " : " + arrTemp[0]);
				var thistr=document.getElementById(thisid);
				var thisClass=thistr.className;
				if(strClass1==""  && thisClass!="" )
				{
					strClass1=thisClass;
				}
				else if(strClass2=="" && thisClass!=strClass1  && thisClass!="")
				{
					strClass2=thisClass;
				}
				if(thistr)
				{
					sortcontainer.appendChild(thistr);
					//implementing the bringing along of subsidiary trs
					//such trs are found by the NumberRows function
					//and flagged with a _sub suffix - they stand out for their colspans
					var additionaltrid=idprefix  + arrTemp[1] +"_sub";
					var additionaltr=document.getElementById(additionaltrid);
					if(additionaltr)
					{
						//alert("DD");
						sortcontainer.appendChild(additionaltr)
					}
					//end implement of subsid
					
					out+=thisid;
				}
				intMeatcount++;
			}
		}
		//any final rows that need to be part of the table
		//but are not sorted
		for(i=arrContainer.length; i<arrContainer.length+4; i++)
		{
			var thisid=idprefix + "x" + i;
			var thistr=document.getElementById(thisid);
			if(thistr)
			{
				sortcontainer.appendChild(thistr);
				
			}
		}
		//alert(strClass2 + " " + strClass1);
		//recolor stripes!
		//this might be a little over-the-top but i felt like having some perfection in my miserable life
		var thesechildren=sortcontainer.childNodes;
		if(intMeatcount>1 )
		{
			var linecount=0;
			for(i=0; i<thesechildren.length; i++)
			{
				
				if(thesechildren[i].id.indexOf(idprefix + "x")<0  &&   thesechildren[i].id.indexOf("_sub")<0)
				{
					linecount++;
					if(linecount/2==parseInt(linecount/2))
					{
						thesechildren[i].className=strClass2;
					}
					else
					{
						thesechildren[i].className=strClass1;
					}
					
					
				}
				else
				{
					//alert(thesechildren[i].id +"\n" + thesechildren[i].id.indexOf("_sub") + "\n"  + thesechildren[i].id.indexOf("b"));
				}
			}
		}
		//replace the unsorted table rows with the sorted rows
		MurderAllTheChildren(thistable);
		if(thistable)
		{
			thistable.appendChild(sortcontainer);
		}
	}
}

function MurderAllTheChildren(obj)
{		
	if(obj)
	{
		var thesechildren=obj.childNodes;
		for(i=0; i<thesechildren.length; i++)
		{
			var thischild=thesechildren[i];
			obj.removeChild(thischild) ;
		}
	}
}

function CreateColumnArray(idsorttable, intColumn, intStart, strDirection)
{
//creates a sorted array of data in the specified column of a table,
//starting with TR intStart
//does a reverse sort if strDirection=="b"
//Judas Gutenberg Dec 04 2007
	var i, j, k;
	var idprefix=idsorttable + "idrow";
	//var idsorttable="idsorttable";
	var arrContainers=new Array();
	var thistable=document.getElementById(idsorttable);
	var arrTRs=document.getElementsByTagName('tr');
	var thiscontent="";
	var out="";
	//var testron="";
	//start at one to skip header
	for(i=intStart; i<(arrTRs.length); i++)
	{
		var tdcount=0;
		var thistr=document.getElementById(idprefix + i);
		if(thistr)
		{
			var thesechildren=thistr.childNodes;
			//alert(thesechildren.length);
			for(j=0; j<thesechildren.length; j++)
			{
				var thischild=thesechildren[j];
				
				if (thischild.nodeName.toLowerCase()=="td")
				{
					
					if(tdcount==intColumn)
					{
						//alert(thischild.nodeName);
						thiscontent=thischild.innerHTML.trim();

						var tdchildren=thischild.childNodes;
						for(k=0; k<tdchildren.length; k++)
						{
							var thistdchild=tdchildren[k];
							if(thistdchild.nodeName)
							{
								//alert(thistdchild.nodeName);
								if (thistdchild.nodeName.toLowerCase()=="a")
								{
									//this allows my code to sort by the anchor text inside
									//an anchor link 
									//if that's what it finds in the table cell
									thiscontent=thistdchild.innerHTML.trim();
									//alert(thiscontent);
								}
								else if (thistdchild.nodeName.toLowerCase()=="input")
								{
									//this allows my code to sort by the value of a textinput
									//if that's what it finds in the table cell
									//thiscontent=thistdchild.getAttribute("value");
									thiscontent=thistdchild.value; //for some reason the preceding method doesn't read dynamic data
									//alert(thiscontent);
									//testron +=thiscontent + "\n";
								}
								else if (thistdchild.nodeName.toLowerCase()=="select")
								{
									//this allows my code to sort by the value of a textinput
									//if that's what it finds in the table cell
									thiscontent=thistdchild[thistdchild.selectedIndex].value;
								}
								thiscontent=thiscontent.toLowerCase();
							}
						}
						if(thiscontent=="")
						{
							thiscontent="0";
						}
					}
					tdcount++;
				}
				
			}
			//handle the sorting of numeric columns:
			if(thiscontent.indexOf(".")>-1)//possibly a decimal number
			{
				var arrContent=thiscontent.split(".");
				if (arrContent.length==2)
				{
					if(parseInt(arrContent[0])==arrContent[0]  && parseInt(arrContent[1])==arrContent[1])
				 	{
						thiscontent= pad(arrContent[0], 9, "0", 1) + "." + pad(arrContent[0], 9, "0", 2);
						
					}
				 }
			
			}
			else if(parseInt(thiscontent)==thiscontent)
			{
				thiscontent= pad(thiscontent, 9, "0", 1) ;
			}
			arrContainers[i]=thiscontent + "^" + i;

			out+=thiscontent + "\n";
		
		}
	
	}
	
	arrContainers.sort();
	if(strDirection=="b")
	{
		arrContainers.reverse();
	}
	for(i=0; i<arrContainers.length; i++)
	{
		thiscontent=arrContainers[i];
		out+=thiscontent + "\n";
	
	}
	
	//alert(out);
	//alert(testron);
	return arrContainers;

}

function pad(str, len, pad, dir) 
{
 //pads str to len with pad string.  works on the left with dir=1, middle with 3, and right with 2
	if (typeof(len) == "undefined") 
	{ 
	var len = 0; 
	}
	if (typeof(pad) == "undefined") 
	{ 
	var pad = ' '; 
	}
	if (typeof(dir) == "undefined") 
	{ var dir = STR_PAD_RIGHT; 
	}
 
	if (len + 1 >= str.length) 
	{
 
		switch (dir)
		{
 
			case 1:
				str = Array(len + 1 - str.length).join(pad) + str;
			break;
 
			case 3:
				var right = Math.ceil((padlen = len - str.length) / 2);
				var left = padlen - right;
				str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
			break;
 
			default:
				str = str + Array(len + 1 - str.length).join(pad);
			break;
		}  
	}
 
	return str;
}
 

function ClimbTreeToTagFromObj(thisItem, tag)
//returns the node of the nearest specified HTML tag above our element described by thisId
//judas gutenberg june 12 2006
{
	var i=0;
	//we loop through a max of ten times and if there's no tr by then there's not gonna be one
	for(i=0; i<10; i++)
	{
		
		thisItem= GetParent(thisItem);
		if (thisItem)
		{
			if (thisItem.nodeName.toLowerCase()==tag)
			{
				return thisItem;
			}
		}
	}
}