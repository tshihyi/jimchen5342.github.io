
function information(){
	if(system.isSignon() == true) return;
	//setting.information = undefined; // for test ...................
	setting.information = Object.assign({
		version: 0,
		signOn: 0,
		switch: 0,
	}, setting.information);

	if(setting.information.version < 3){
		setting.information.version++;
		window.showToast({
			msg: "切換下方的開關即可編輯及即時存檔", 
			icon: "info",
			allowToastClose: false
		});
	} else if(system.isSignon() == false && setting.information.signOn < 3) {
		setting.information.signOn++;
		window.showToast({
			msg: "記得要註冊哦", 
			icon: "info",
			allowToastClose: false
		});
	}
	storage.Setting(setting);
}
function tooltips(){
	$('#speech').tooltip({
			position: 'bottom',
			content: '訊息',
			//trackMouse:true,
			deltaX: 0,
			deltaY: 0,
			showDelay:300,
			hideDelay:500
	});
	//if(system.isSignon() == true) return;
	$('#reload').tooltip({
			position: 'bottom',
			content: system.isTeacher() ? 'reload' : '清空',
			//trackMouse:true,
			deltaX: 0,
			deltaY: 0,
			showDelay:300,
			hideDelay:500
	});
	$('#signon').tooltip({
			position: 'bottom',
			content: system.isSignon() ? '登出：<br />' + storage.System().user : '註冊',
			//trackMouse:true,
			deltaX: 0,
			deltaY: 0,
			showDelay:300,
			hideDelay:500
	});

	$('#student').tooltip({
			position: 'bottom',
			content: '學生管理',
			//trackMouse:true,
			deltaX: 0,
			deltaY: 0,
			showDelay:300,
			hideDelay:500
	});

	if(setting.information.switch < 3) {
		$("#lblSwitch").tooltip({
				position: 'top',
				content: function(){
					return '關閉狀態: 即可編輯及即時存檔<br />開啟狀態: 重新載入教師版, 系統會保留你的程式碼'
				},
				//trackMouse:true,
				deltaX: 0,
				deltaY: 0,
				showDelay: 300,
				hideDelay: 500
		});
	}
}
function adjuctFile(){
	//, #divUser"
	$(".lblSwitch").css({"visibility": subject == "作業" ? "hidden" : "visible"});
	let display = (subject == "作業") ? "inline-block" : "none";
	$(".layout-panel-west .panel-tool a:nth-child(1)").css("display", display);
	$(".layout-panel-west .panel-tool a:nth-child(2)").css("display", display);
}
function centerIcon(){ // 
	if($("#center .tabs-tool table td").size() == 0){
		setTimeout(function(){
		}, 500);
	} else {
		$("#center .tabs-tool table td:nth-child(1)").css("display", // reload
			(system.isTeacher() && student.length == 0) || (!system.isTeacher() && readOnly) ? "none" : "table-cell");
		$("#center .tabs-tool table td:nth-child(2)").css("display", // msg
			! system.isSignon() ? "none" : "table-cell");
			$("#center .tabs-tool table td:nth-child(3)").css("display", // student
			system.isTeacher() && system.isSignon() ? "table-cell" : "none");
		$('body').layout('resize');
		// $("#center .tabs-tool table td:nth-child(2)").css("display", 
		// 	system.isSignon() ? "none" : "table-cell");
		//$("#center .tabs-tool").remove();		
		if(system.isTeacher())
			$(".icon-student").css("background", "url(icons/student.png) no-repeat center center");
		if(system.isSignon())
			$(".icon-man").css("background", "url(icons/user.png) no-repeat center center");
	}
}

function adjustPanel(){
	let collapsed = true;
	let west = $('body').layout('panel','west').panel({
		minWidth: 160,
		onCollapse:function(){
			storage.Setting({"west-collapse": "Y"});
		},
		onExpand:function(){
			storage.Setting({"west-collapse": "N"});
		},
		onResize:function(w, h){
		}
	});

	if(typeof setting["west-collapse"] == "string" && setting["west-collapse"] == "Y") {
		$('body').layout('collapse', 'west');
		setTimeout(function(){
			$('body').layout('resize');
		}, 600);		
	}

	let east = $('body').layout('panel','east').panel({
		minWidth: 200,
		onCollapse:function(){
			//alert('collapse');
		},
		onExpand:function(){
			//alert('expand');
		},
		onResize:function(w, h){
			if(collapsed == false){
				setting.east = w;
				storage.Setting(setting);
			}
			eastResizeIcon(w);
		}
	});
	$('#doc').tabs({ // east
		onSelect:function(title, index){
			storage.Setting({doc: index});
		},
		tools:[{
        iconCls:'icon-left',
        handler:function(){
					collapsed = true;
					eastResize(setting.east);
					setTimeout(function(){
						collapsed = false;
					}, 500);
        }
    },{
        iconCls:'icon-right',
        handler:function(){
					collapsed = true;
					eastResize(160);
					setTimeout(function(){
						collapsed = false;
					}, 500);
        }
    }]
	});
	$('#source').tabs({ // center, toolbar
		onSelect:function(title, index){
			panel = title;
			for(let i = 0; i < mode.length; i++){
				let key = mode[i].src;
				if(key.toLowerCase() == panel.toLowerCase()){
					let x = $("div[src='" + key + "'] iframe").get();
					if(x.length == 1){
						x[0].focus();
						iframe[key].myfocus();
					}
					break;
				}
			}
		},
		tools:[{
			iconCls: 'icon-reload',
			id: 'reload',
			handler:function(){
				for(let key in iframe){
					iframe[key].reset();
				}
				if(student.length > 0){
					userData = {};
					loadData(function(){
						reload();
					});
				} else {
					result.location.assign("./empty.html");
					setTimeout(function(){
						if(subject != "作業")
							delete userData[lesson];
						storage[subject] = JSON.stringify(userData);
						if(system.isSignon()){
							let data = null;
							if(subject == "作業")
								data = {text: userData[lesson].text};
							fireBase.database().ref(fireBase.uid + "/" + subject + "/" + lesson).set(data)
							.then(()=>{
							}).catch(arg=>{
								console.log(arg)
							});						
						}
					}, 1000);				
				}
			}
		}, {
			iconCls:'icon-speech',
			id: "speech",
			handler:function(){
				if(!system.isTeacher() || student.length > 0){
					$('#winSpeech').window('open');
				} else {
					alert("請先選取學生才可進行對話!!")
				}
			}		
		}, {
			iconCls:'icon-student',
			id: "student",
			handler:function(){
				studentAdd();
			}
		}, {
			iconCls:'icon-man',
			id: "signon",
			handler:function(){
				if(system.isSignon()){
					var r = confirm("是否確定登出!");
					if (r == true) {
						storage.clear();
						location.reload();
					} 
				} else
					fireBase.login();
			}
    }]
	});

	function eastResizeIcon(w){
		if($("#doc .tabs-tool table td").size() == 0){
			setTimeout(function(){
				eastResizeIcon(w);
			}, 500);
		} else {
			let max = w > 160 ? true : false;
			$("#doc .tabs-tool table td:nth-child(1)").css("display", max == false ? "table-cell" : "none");
			$("#doc .tabs-tool table td:nth-child(2)").css("display", max == true ? "table-cell" : "none");
		}
	}
	function eastResize(w){
		var p = $('body').layout('panel','east');  
		p.panel('resize',{width: w});
		$('body').layout('resize');
		eastResizeIcon(w);
	}

	let w = typeof setting.east == "number" ? setting.east : 300;
	eastResize(w);
	setTimeout(function(){
		collapsed = false;
		if(setting.doc != 0)
			$("#doc").tabs("select", setting.doc);
	}, 500);
	if(typeof setting.student == "string" && setting.student.length > 0){
		setTimeout(function(){
			if(fireBase.loaded)
				$('#user').combobox('setValue', setting.student);
		}, 3000);
	}
}

function adjustUser(){
	if(system.isTeacher() == false){
		$('#divUser').remove();
	} else {
		let user = [{id: 0, text: "教師版"}];
		if(storage.System().students.length > 0)
			user = user.concat(JSON.parse(storage.System().students));
		$(".lblSwitch").remove();
		$('#user').combobox({
			data: user,
			onSelect(value){
				student = value.id == 0 ? "" : value.id;
				readOnly = value.id == 0 ? true : false;
				if(student.length > 0 && !system.isSignon()){
					alert("尚未登入!!");
					return;
				}
				if(student.length > 0){
					fireBase.listen(student + "/" + subject + "/" + lesson);
				} else {
					fireBase.listenClear();
				}
				//console.log(student)
				//if(userData == "undefined")
				userData = {};
				if(fireBase.loaded){
					storage.Setting({student});
					loadData(function(){
						reload();
					});					
				}
			}
		});
	}
}