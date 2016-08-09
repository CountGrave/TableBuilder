/**
 * @author jaakko.hautamaki
 */

$.extend($.expr[":"],
	{
		"Contains-ci": function (elem, i, match, array) {
			return (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
		}
	});
$(document).on( 'click', 'table.tablebuilder tr.mainrow', function(event){
	
	var body = $(this).closest('tbody');
	if(body.hasClass('visible')){
		body.removeClass('visible').find('tr').not(this).hide('fast');
	}else{
		body.addClass('visible').find('tr').not(this).show('fast');
	}	
});
$(document).on( 'click', 'table.tablebuilder p.tb-pagecontainer span.tb-pagenbr', function(event){

		TableBuilder.selectedPage = parseInt($(this).html());
		TableBuilder.updateTable();
	
});
$(document).on( 'click', 'table.tablebuilder p.tb-pagecontainer div.tb-next.active', function(event){

		TableBuilder.selectedPage = TableBuilder.selectedPage + 1;
		TableBuilder.updateTable();
	
});
$(document).on( 'click', 'table.tablebuilder p.tb-pagecontainer div.tb-back.active', function(event){

		TableBuilder.selectedPage = TableBuilder.selectedPage - 1;
		TableBuilder.updateTable();
	
});
jQuery.fn.extend({
	
	tablebuilder: function(settings){
		
		if(settings['rows'] > 1){
			TableBuilder.pageDivider = settings['rows'];
			TableBuilder.addpages = true;
		} 
		if(settings['maxrows'] > 1) TableBuilder.maxrows = settings['maxrows'];
		if(settings['filterlimit'] > 1) TableBuilder.filterlimit = settings['filterlimit'];
		if(settings['showrowcount']) TableBuilder.showrowcount = true;
		if(settings['showrowcountdetails']) TableBuilder.showrowcountdetails = true;
		if(settings['header']) TableBuilder.header = settings['header'];
		if(settings['sum_header']){
			TableBuilder.sum_header = settings['sum_header'];
		} 
		if(settings['s_icon'] == 'filter') TableBuilder.s_icon = 'filter';
			
		TableBuilder.init($(this));
	},
	getLeftBorderWidth: function () {
	
		var thinBorder = 1;
		var mediumBorder = 3;
		var thickBorder = 5;
		var leftBorderWidth = $(this).css("borderLeftWidth");
		var borderWidth = 0;

		switch (leftBorderWidth) {
		case "thin":
			borderWidth = thinBorder;
			break;
		case "medium":
			borderWidth = mediumBorder;
			break;
	    case "thick":
			borderWidth = thickBorder;
	        break;
	    default:
			borderWidth = Math.round(parseFloat(leftBorderWidth));
			break;
		}

		return borderWidth;
	}
});
	
 ;TableBuilder = {
	
	rowtemp : false,
	showrowcount : false,
	showrowcountdetails : false,
	rowcounter : false,
	hasSort : false,
	enabled : false,
	maxrows : 500,
	imagePath : false,
	autoSort : true,
	addpages : false,
	sort_time : 2,
	forceSort : false,
	hasPages : false,
	visiblerows : false,
	multibody : false,
	tablepages : 0,
	hiddenrows: false,
	selectedPage : 1,
	cellcount: 0,
	searchinputs: false,
	s_icon: false,
	caption : false,
	captioncontainer : false,
	hasfilter: false,
	hasStripes: false,
	header : false,
	sum_header : '<b>&#931</b>',
	filterlimit: 5,
	pageDivider : 100,
	table : false,
		
	updateTable: function(){
	
		TableBuilder.rowtemp.hide();

		if(TableBuilder.hasPages || TableBuilder.showrowcount) TableBuilder.tablepages.empty();

		if(TableBuilder.visiblerows.length > 0){

			var start = 0;
			var to = TableBuilder.pageDivider;
			
			if(to > TableBuilder.visiblerows.length) to = TableBuilder.visiblerows.length;

			if(TableBuilder.hasPages){
	
				var rowCount = TableBuilder.visiblerows.length;

				if(TableBuilder.selectedPage == 1){

					if(rowCount > 1){

						TableBuilder.visiblerows.filter(':lt('+ TableBuilder.pageDivider +')').show();
						
					}else{
						
						TableBuilder.visiblerows.show();
					}
				}else{
						
				start = ((TableBuilder.selectedPage-1) * TableBuilder.pageDivider);
				to = ( parseInt(start) + parseInt(TableBuilder.pageDivider) );

				if(rowCount < to){
					to = rowCount;
				}		
					TableBuilder.visiblerows.slice(start, to).show();
				} 
				
				var pageCount = Math.ceil(( rowCount / TableBuilder.pageDivider));	
				TableBuilder.recountPages(pageCount);
				
				if(TableBuilder.showrowcount){
					TableBuilder.displayrowcount(start, to, pageCount);
				}

			}else{

				TableBuilder.visiblerows.show();
				
				if(TableBuilder.showrowcount){
					TableBuilder.displayrowcount(0, 0, pageCount);
				}
			}
		}else{
			
			if(TableBuilder.showrowcount){
				TableBuilder.displayrowcount(0, 0, pageCount);
			}
		}
	},
	recountPages: function(pageCount){

			if(TableBuilder.hasPages){
				var pageDivContent = '';

				for(var i=1; i < pageCount+1; i++){
						
					if(i == TableBuilder.selectedPage){
						
						pageDivContent += '<span class="tb-pagenbr selected">'+ i +'</span>';
						
					}
					else {
						pageDivContent += '<span class="tb-pagenbr">'+ i +'</span>';
					}	
					
					if(i%65==0){
						
						pageDivContent += '<br>';
					}	
				}
				
				TableBuilder.tablepages.html(pageDivContent);
			}
		},
	displayrowcount: function(from, to, pagecount){

			if(TableBuilder.showrowcountdetails && pagecount > 1){

				if(from == 0) from = 1;
				
				var rowdetails = '<span class="captionbox">('+ from +' - '+ to +')</span>';
				
				if(TableBuilder.hasfilter) rowdetails = '<span class="captionbox filtered">('+ from +' - '+ to +')</span>';

				TableBuilder.tablepages.append(rowdetails);
			}
			
			var rows_span = document.createElement("span");
			if(TableBuilder.hasfilter) $(rows_span).addClass('filtered');
			if(TableBuilder.hasPages){
				$(rows_span).addClass('fixed');
			}
			$(rows_span).attr('id', 'tb-rows').html(TableBuilder.sum_header + ' ' + TableBuilder.visiblerows.length).addClass('captionbox').appendTo(TableBuilder.tablepages);
	},
	styleTable: function(){

		//TableBuilder.visiblerows.detach().removeClass('odd').filter(':odd').addClass('odd').appendTo(TableBuilder.table);
		if(TableBuilder.hasStripes){
			TableBuilder.visiblerows = TableBuilder.visiblerows.detach().toArray();
			
			for (var i=0, length = TableBuilder.visiblerows.length; i < length; i++) {
				
				if(i%2==0){
					
					$(TableBuilder.visiblerows[i]).addClass('odd');

				}else{
					
					$(TableBuilder.visiblerows[i]).removeClass('odd');
				}			
			}
			
			TableBuilder.visiblerows = $(TableBuilder.visiblerows).appendTo(TableBuilder.table);
		}
	},
	filterTablev2: function(columnindex, filter) {

	var matchfound = false;

		if(filter.length > 0){
	
			TableBuilder.rowtemp.removeClass('selected').filter(function(){
				
				var match_cell = $(this).children().eq(columnindex).filter(':Contains-ci("' + filter + '")').addClass('tb-match');
	
				if(match_cell.length){
					
					matchfound = true;
					var origString = match_cell.html();
					match_cell.empty().closest('tr').addClass('selected');
	
					filter2 = filter.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");
					
					var pattern = new RegExp("(" + filter2 + ")", "gi");
			
					var myString = origString.replace(pattern, function (s) {
			
						return '<span class="highlight">' + s + '</span>';
					});
					
					//myString = myString.replace(/(<span class="highlight">[^<>]*)((<[^>]+>)+)([^<>]*<\/span>)/, '$1<span class="highlight">$2</span>$4');
					
					match_cell.append(myString);
				}
			});
		}

		return matchfound;
	},
	filterTable: function(columnindex, filter) {

		var matchfound = false;

		if(filter.length > 0){

			var origString = false;
			
			TableBuilder.rowtemp.removeClass('selected').filter(function(){
				if(TableBuilder.multibody){
					
					$(this).find('tr.mainrow').children().eq(columnindex).filter(':Contains-ci("' + filter + '")').addClass('tb-match').html(function () {
						matchfound = true;
						$(this).closest('tbody').addClass('selected');
					});	
				}else{
					
					$(this).children().eq(columnindex).filter(':Contains-ci("' + filter + '")').addClass('tb-match').html(function () {
						matchfound = true;
						$(this).closest('tr').addClass('selected');
					});
				}
			});
		}

		return matchfound;
	},
	sorttable: function(columnindex, mode, invert, reverse) {
	
		if(reverse && invert) invert = false;
		else if(reverse && !invert) invert = true;
	
		TableBuilder.visiblerows.detach().toArray();
		
		var map = [];
		var result = [];
		
		for (var i=0, length = TableBuilder.visiblerows.length; i < length; i++) {

		//var td = $(TableBuilder.visiblerows[i]).children().eq(columnindex).addClass('tb-sortcell'); //Sortcells
		
		if(TableBuilder.multibody){
			
			var td = $(TableBuilder.visiblerows[i]).find('tr.mainrow').children().eq(columnindex);
		}else{
			var td = $(TableBuilder.visiblerows[i]).children().removeClass('tb-sortcell').eq(columnindex).addClass('tb-sortcell');
		}

		var sortinput = td.find('input.tb_sorter');
		var sortvalue = false;
			
		if(sortinput.length) sortvalue = sortinput.val();
		else sortvalue = $.text(td);
		//else sortvalue = td.text();

		if(mode == 'numbersort'){
			
			sortvalue = +(sortvalue);
		}
		else if(mode == 'datesort'){
			
			var parts1 = sortvalue.match(/(\d+)/g);
			var sortvalue = new Date(parts1[0], parts1[1]-1, parts1[2], parts1[3], parts1[4], parts1[5]);
		}
			
		map.push({
			ind: i,
			value: sortvalue
		  }); 
		}
		
		if(mode == 'datesort'){
			
			var comp2 = -1;
			var comp1 = 1;
	
			if(invert){
				comp2 = 1;
				comp1 = -1;
			}
			map.sort(function(a, b) {
				
				if(!a.value	||	typeof a.value === 'undefined' || a.value == 0 || a.value == ' ') return 1;
				if(!b.value	||	typeof b.value === 'undefined' || b.value == 0 || b.value == ' ') return -1;
				return a.value > b.value ? comp1 : a.value < b.value ? comp2 : 0;
	
			});
			
		}else if(mode == 'numbersort'){
		
			var comp2 = 1;
			var comp1 = -1;
	
			if(invert){
				comp2 = -1;
				comp1 = 1;
			}
			
			map.sort(function(a, b) {
			
				if(!a.value	||	typeof a.value === 'undefined' ) return 1;
				if(!b.value	||	typeof b.value === 'undefined') return -1;
				return a.value > b.value ? comp1 : a.value < b.value ? comp2 : 0;
				
			});
			
		}else{
			
			var comp2 = 1;
			var comp1 = -1;

			if(invert){
				comp2 = -1;
				comp1 = 1;
			}
			map.sort(function(a, b) {
			
				if(!a.value	||	typeof a.value === 'undefined' ) return 1;
				if(!b.value	||	typeof b.value === 'undefined') return -1;
				return a.value > b.value ? comp1 : a.value < b.value ? comp2 : 0;
				
			});
			
		}
		// copy values in right order
		for (var i=0, length = map.length; i < length; i++) {
			
			var temp = TableBuilder.visiblerows[map[i].ind];
			
			if(TableBuilder.hasStripes){
				
				if(i%2 == 0) $(temp).addClass('odd');
				else $(temp).removeClass('odd');
				
			}

			result.push(temp);
		}

		TableBuilder.visiblerows = $(result);
		TableBuilder.visiblerows.appendTo(TableBuilder.table);
	},
	init: function(table){
				
		TableBuilder.table = table; //cache

		if(TableBuilder.table.find('tbody').length > 1){
			
			TableBuilder.multibody = true;
			TableBuilder.rowtemp = TableBuilder.table.addClass('multibody').find('tbody'); //cache bodys
			
		}else{
			
			if(TableBuilder.table.find('tbody tr.mainrow').length){
				
				TableBuilder.multibody = true;
				TableBuilder.rowtemp = TableBuilder.table.addClass('multibody').find('tbody'); //cache bodys
				
			}else{
				
				TableBuilder.rowtemp = TableBuilder.table.find('tbody tr'); //cache rows
			}	
		}
		if(TableBuilder.rowtemp.length > 1 && TableBuilder.rowtemp.length < TableBuilder.maxrows){
			
			TableBuilder.enabled = true;
			TableBuilder.table.addClass('active');
			var addfilters = false;
			if(TableBuilder.rowtemp.length > TableBuilder.filterlimit){
				addfilters = true;
			}else{
				TableBuilder.table.find('thead th').removeClass('filter');
			}
			
		}else{
			
			TableBuilder.table.find('thead th').removeClass('enabled');
		} 
		
		if(TableBuilder.table.hasClass('stripes')){
			
			TableBuilder.hasStripes = true;
			TableBuilder.table.addClass('zebra')
		}else{
			
			TableBuilder.table.addClass('solid');
		}
		
		TableBuilder.imagePath = '';
		TableBuilder.hasSort = false;
		TableBuilder.cellcount = 0;	
		var footer = '<tfoot><tr id="tb_keeper">';
		var height_temp = 0;
		var firstchild = true;
		
		TableBuilder.table.find('thead th').each(function(index){
			
			TableBuilder.cellcount++;
			footer += '<td><div></div></td>';
			
			if($(this).hasClass('enabled') && TableBuilder.enabled){
				var left = 0;
				if(firstchild){
					firstchild = false;
					left = TableBuilder.table.getLeftBorderWidth();
					if(left == 1){
						left = '-1';
					}else{
						left = 0;
					}
				}
				$(this).width($(this).width() + 28); //new content is wider
				TableBuilder.hasSort = true;
				var headertxt = $(this).html();
				$(this).contents().filter(function(){
					return (this.nodeType == 3);
				}).remove();
				var outheight = parseInt($(this).outerHeight());
				
				if(outheight > height_temp) height_temp = outheight;
				$(this).append('<div class="tb-thcontainer"><div class="tb-sorterdiv"><div class="tb-sorterpic"></div></div><div class="tb-sorterdiv">'+ headertxt +'</div></div>');
				if($(this).hasClass('filter') && addfilters){
					var div_class = 'tb-searchicon';
					if(TableBuilder.s_icon == 'filter') div_class = 'tb-filtericon';
					$(this).append('<div style="position: absolute; left: '+ left +'px;" class="tb-searchcontainer"><input type="text" class="tb-search" /><div class="'+ div_class +'"></div></div>');
				} 
			}	
		});
		
		var searchcontainers = TableBuilder.table.find('thead th div.tb-searchcontainer');
		if(searchcontainers.length && height_temp > 0){
			height_temp = height_temp - 2;
			searchcontainers.css('bottom', height_temp +'px');
		} 
		
		footer += '</tr></tfoot>';	
		TableBuilder.table.append(footer);
		TableBuilder.table.find('#tb_keeper td div').each(function(ind){
			
			//var width = $(this).width();
			var width = TableBuilder.table.find('thead th').eq(ind).outerWidth();
			$(this).width(width);
			
		});	
		if(TableBuilder.rowtemp.length){
			
			if(TableBuilder.showrowcount || (TableBuilder.rowtemp.length > TableBuilder.pageDivider && (TableBuilder.table.hasClass('pages') || TableBuilder.addpages)) ){
				
				var tablecaption = document.createElement("caption");
				
				$(tablecaption).html('<p class="tb-pagecontainer"></p>').prependTo(TableBuilder.table);
				
				TableBuilder.caption = TableBuilder.table.find('caption');
				
				if( TableBuilder.caption.find('p.tb-pagecontainer').length > 0 ){ //no pages, show rowcount

					TableBuilder.tablepages = TableBuilder.caption.find('p.tb-pagecontainer');
					
					if(TableBuilder.rowtemp.length > TableBuilder.pageDivider && (TableBuilder.table.hasClass('pages') || TableBuilder.addpages)){ //has pages
					
							TableBuilder.selectedPage = 1;
							TableBuilder.hasPages = true;
							TableBuilder.table.addClass('hascaption');
						
					}else{
						TableBuilder.caption.addClass('nopages')
						TableBuilder.table.addClass('hascaption');
						TableBuilder.hasPages = false;	
					}
				}
			}

			TableBuilder.visiblerows = TableBuilder.rowtemp;
			TableBuilder.updateTable();
		}
		
		if(TableBuilder.header.length > 1){
			
			if(TableBuilder.caption.length){
				
				if(TableBuilder.hasPages){
					$('<h2 id="tb_header">' + TableBuilder.header + '</h2>').insertBefore(TableBuilder.table);
				}else{
					TableBuilder.tablepages.prepend('<span id="tb_captionheader">' + TableBuilder.header + '</span>');
				}
				
			}else{
				
				TableBuilder.table.prepend('<caption><center><span id="tb_captionheader">' + TableBuilder.header + '</span></center></caption>');
			}
		}	
		//---New functions
		jQuery.fn.extend({

			hideRowsByClass: function(className){
				var obj = $(this).filter('table.tablebuilder');
				if(obj && TableBuilder.enabled){
					if(TableBuilder.multibody) TableBuilder.table.find('tbody.' + className).addClass('hidden');
					else TableBuilder.table.find('tbody tr.' + className).addClass('hidden');
					if(TableBuilder.hasPages) TableBuilder.selectedPage = 1;
					TableBuilder.rowtemp = TableBuilder.rowtemp.filter(':not(.hidden)');
					TableBuilder.updateTable();
				}
			},
			showRowsByClass: function(className){
				var obj = $(this).filter('table.tablebuilder');
				if(obj && TableBuilder.enabled){
					if(TableBuilder.multibody) TableBuilder.table.find('tbody.' + className).removeClass('hidden');
					else TableBuilder.table.find('tbody tr.' + className).removeClass('hidden');
					if(TableBuilder.hasPages) TableBuilder.selectedPage = 1;
					TableBuilder.rowtemp = TableBuilder.rowtemp.filter(':not(.hidden)');
					TableBuilder.updateTable();
				}
			},
			hideRows: function(rows){
				var obj = $(this).filter('table.tablebuilder');
					if(obj && TableBuilder.enabled){
					$(rows).addClass('hidden');
					if(TableBuilder.hasPages) TableBuilder.selectedPage = 1;
					TableBuilder.rowtemp = TableBuilder.rowtemp.filter(':not(.hidden)');
					TableBuilder.updateTable();
				}
			},
			hideBodys: function(bodys){
				var obj = $(this).filter('table.tablebuilder');
					if(obj && TableBuilder.enabled){
					$(bodys).addClass('hidden');
					if(TableBuilder.hasPages) TableBuilder.selectedPage = 1;
					TableBuilder.rowtemp = TableBuilder.rowtemp.filter(':not(.hidden)');
					TableBuilder.updateTable();
				}
			},
			resetTable: function(){
				var obj = $(this).filter('table.tablebuilder');
					if(obj && TableBuilder.enabled){
					TableBuilder.table.find('tr.hidden').removeClass('hidden');
					if(TableBuilder.hasPages) TableBuilder.selectedPage = 1;
					TableBuilder.updateTable();
				}
			}
		});

		//------------------------------- Input handlers -------------------------------------------------
		
		TableBuilder.searchinputs = TableBuilder.table.find("th input.tb-search");
		
		TableBuilder.searchinputs.bind( "change", function() {
			
			TableBuilder.searchinputs.not(this).val('');
		});
		$("div.tb-searchcontainer" ).mouseout(function() {
			TableBuilder.searchinputs.blur();
		});
		TableBuilder.searchinputs.bind( "keyup", function() {

			if($(this).val() == '' || !$(this).val().length){

				TableBuilder.searchinputs.val('');
				TableBuilder.table.find('thead th.enabled').removeClass('found filtered');
				TableBuilder.visiblerows.find('td.tb-match').removeClass('tb-match');
				//TableBuilder.table.find('td.tb-match').removeClass('tb-match').find('span.highlight').contents().unwrap();
				TableBuilder.hasfilter = false;
				TableBuilder.selectedPage = 1;
				TableBuilder.visiblerows = TableBuilder.rowtemp;
				var sort_th = TableBuilder.table.find('thead th.selected');
					
				if(sort_th.length){
					
					var index = sort_th.index();
					var mode = "alphasort";
		
					if (sort_th.hasClass('datesort')) {
						mode = "datesort";
					}else if (sort_th.hasClass('numbersort')) {
						mode = "numbersort";
					}
					
					TableBuilder.sorttable(index, mode, sort_th.hasClass('asc'), sort_th.hasClass('reverse'));
					TableBuilder.updateTable();	
					
				}else{
										
					TableBuilder.styleTable();
					TableBuilder.updateTable();
				}
			}
		});
		TableBuilder.table.find("th div.tb-filtericon, th div.tb-searchicon").bind( "click", function() {

			var closest_th =  $(this).closest('th');
			var index = closest_th.index();
			var userinput = closest_th.find('input.tb-search').val();
			var match = false;

			if(userinput != ''){
				
				TableBuilder.table.find('thead th').removeClass('found filtered');
				
				TableBuilder.visiblerows = TableBuilder.rowtemp;
				
				TableBuilder.table.find('td.tb-match').removeClass('tb-match').find('span.highlight').contents().unwrap();

				if(TableBuilder.filterTable(index, userinput)){
					
					TableBuilder.table.removeClass('stripes');
					TableBuilder.hasfilter = true;
					TableBuilder.visiblerows = TableBuilder.rowtemp.filter('.selected');
					closest_th.addClass('found filtered');
					
				}else{
					//TableBuilder.visiblerows = TableBuilder.rowtemp;
					TableBuilder.hasfilter = false;
				}
				
				var sortcell = TableBuilder.table.find('thead th.selected');

				if(!sortcell.length){
					
					TableBuilder.styleTable();
				} 
				else{
		
					var mode = "alphasort";

					if ( sortcell.hasClass('datesort')) {
						mode = "datesort";
					}else if ( sortcell.hasClass('numbersort')) {
						mode = "numbersort";
					}

					TableBuilder.sorttable(sortcell.index(), mode, sortcell.hasClass('asc'), sortcell.hasClass('reverse'));	
				}
				
				TableBuilder.selectedPage = 1;
				TableBuilder.updateTable();
			}		
		});
		TableBuilder.table.find("th.enabled div.tb-thcontainer").bind( "click", function() {
			
			var selected_th = $(this).closest('th');
			var ascending = selected_th.hasClass('asc');

			if(TableBuilder.hasSort){
				
				TableBuilder.table.removeClass('stripes');
				
				var index = selected_th.index();
				var mode = "alphasort";

				if ( selected_th.hasClass('datesort')) {
					mode = "datesort";
				}else if ( selected_th.hasClass('numbersort')) {
					mode = "numbersort";
				}
				
				TableBuilder.selectedPage = 1;
				TableBuilder.table.find('thead th').removeClass('selected asc').find('div.tb-sorterpic').removeClass('desc asc');
				//TableBuilder.rowtemp.find('td.tb-sortcell').removeClass('tb-sortcell'); //SORTCELLS

				if(ascending){
					
					selected_th.removeClass('asc').addClass('selected').find('div.tb-sorterpic').addClass('desc');
					TableBuilder.sorttable(index, mode, false, selected_th.hasClass('reverse'));

				}else{

					selected_th.addClass('asc selected').find('div.tb-sorterpic').addClass('asc');
					TableBuilder.sorttable(index, mode, true, selected_th.hasClass('reverse'));
				}
	
				TableBuilder.updateTable();
			}
		});		
	}
}
