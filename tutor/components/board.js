(function(window, undefined) {
	let board = {}, canvas;
	board.load = function(base64){
		$('#winBoard').window('open');
		//console.log(base64)
		$("#layoutBoard").html("")
		var img = new Image();
		img.onerror = function() {
		};
		img.onload = function() {
			canvas = document.createElement('canvas');
			let ctx = canvas.getContext("2d");
			canvas.width = $("#layoutBoard").width() - 0;
			canvas.height = $("#layoutBoard").height() - 0;
			ctx.drawImage(img,0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
			$(canvas).appendTo("#layoutBoard")
		};
		img.src = base64;
	}
	function adjust(){
		$('#winBoard').window({
			border:'thin',
			cls:'c10',
			maximizable: false,
			collapsible: false,
			draggable: false,
			onOpen:function(){ 
			},
			onBeforeClose:function(){ 
			},
			onMove: function(left, top) {
			},
			onResize: function(width, height) {
			},
			onCollapse:function(){
			},
			onExpand:function(){
			},
			onMaximize: function(){
			},
			onMinimize: function(){
			},
			tools:[{
				iconCls: 'icon-ok',
				handler:function(){
					system.loading.show();
					let data = canvas.toDataURL();
					console.log(data)
					let obj = {
						type: "canvas",
						date: fireBase.serverTime(),
						uid: fireBase.uid,
						data: data
					}
					if(system.isTeacher())
						obj.to = student; // : "All"
					let key = storage.System().teacher.length > 0 ? storage.System().teacher : fireBase.uid;
					fireBase.database().ref("broadcast/" + key + "/" + fireBase.uid).set(obj)
					.then(()=>{
						system.loading.close();
						window.showToast({
							msg: "圖檔已送出", 
							icon: "info",
							allowToastClose: false
						});
					}).catch(arg=>{

					});
				}
			/*}, {
				iconCls:'icon-speech',
				id: "speech",
				handler:function(){
				}		
			}, {
				iconCls:'icon-man',
				id: "man",
				handler:function(){

				}*/
			}]
		});
		//$('#winBoard').window('open');
	}
	setTimeout(function(){
		adjust();
	}, 600);

	board.listen = function(snap){
		$('#winBoard').window('open');
		let row = snap.val();
		//console.log(base64)
		if(typeof row.cmd == "string"){

		} else if(typeof row.data == "string"){
			$("#layoutBoard").html("")
			var img = new Image();
			img.onerror = function() {
			};
			img.onload = function() {
				canvas = document.createElement('canvas');
				let ctx = canvas.getContext("2d");
				canvas.width = $("#layoutBoard").width() - 0;
				canvas.height = $("#layoutBoard").height() - 0;
				ctx.drawImage(img,0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
				$(canvas).appendTo("#layoutBoard")
			};
			img.src = row.data;			
		}
	}
	window.board = board;
})(window);