// from firebase
var config = {
  apiKey: "AIzaSyAzq5JO2tcopubdHp6V3widF9qVn8lm1TM",
  authDomain: "afko-gbook.firebaseapp.com",
  databaseURL: "https://afko-gbook.firebaseio.com",
  projectId: "afko-gbook",
  storageBucket: "afko-gbook.appspot.com",
  messagingSenderId: "769455268887"
};

firebase.initializeApp(config);

/***** 전역변수 설정 *****/
var log = console.log;
var auth = firebase.auth(); // login한 사용자인지 아닌지 확인. Google Login연동
var db = firebase.database(); // DB 연동
var googleAuth = new firebase.auth.GoogleAuthProvider(); // firebase에서 지원해주는 auth GoogleAuthProvider
var ref = null; // 참조해 올 주소
var user = null;
var key = null;

/***** Auth *****/
$("#login_bt").on("click", function () {
  auth.signInWithPopup(googleAuth); // 팝업창 띄워서 구글 로그인
  // auth.signInWithRedirect();
});

$("#logout_bt").on("click", function () {
  auth.signOut();
})

// callback개념으로 구현, 이벤트만 붙이면 된다.
auth.onAuthStateChanged(function (result) {
  if (result) {
    user = result;
    var email = '<img src="' + result.photoURL + '" style="width:36px; border-radius:70%;margin-right:5px;">' + result.email;

    $("#login_bt").hide();
    $("#logout_bt").show();
    $("#user_email").html(email);
    init();
    
  } else {
    user = null;
    $("#login_bt").show();
    $("#logout_bt").hide();
    $("#user_email").html('');
    init();
  }
}); // 이벤트에 callback을 붙인다.

/***** Database *****/
// init(); 

function init() {
  $(".gbooks").empty();

  ref = db.ref("root/gbook"); // root에 있는 gbook, 객체를 생성한 instance가 ref에 담긴 것.
  // log("ref1: " + ref);
  ref.on("child_added", onAdd); // child_added는 firebase에서 만들어놓은 event, ref의 데이터가 추가 된다면 실행
  // log("callback 대기중")

  // Delete Method를 붙이고
  ref.on("child_removed", onRev);
  // Modify Method
  ref.on("child_changed", onChg);

}

function onAdd(data) {
  // key와 value로 데이터에 접근
  var k = data.key;
  var v = data.val();

   // 날짜 커스텀
  var date = tsChg(v.wdate);

  // 내가 쓴 글 찾기
  var icon = "";
  if (user) {
    if (user.uid == v.uid) {
      icon += '<i onclick="onUpdate(this);" class="fas fa-edit"></i> '; // inline으로
      icon += '<i onclick="onDelete(this);" class="fas fa-trash"></i> ';
    }
  }

  var html = '<ul id="' + k + '" data-uid="' + v.uid + '" class="gbook clear">';
  html += '<li>' + v.uname + ' (' + v.email + ') | <span>' + date + '</span></li>';
  html += '<li>' + v.content + '</li>';
  html += '<li>' + icon + '</li>';
  html += '</ul>';

  $(".gbooks").prepend(html);
  

  // log("callback 실행")
  // log(data);
}; // 여기까지는 이벤트만 준비된 상태

function onRev(data) {
  var k = data.key;
  $("#" + k).remove(); // jQuery remove
}

function onChg(data) {
  var k = data.key;
  var v = data.val();
  $("#" + k).children("li").eq(0).children("span").html(tsChg(v.wdate));
  $("#" + k).children("li").eq(1).html(v.content);
  $("#" + k).find(".fa-edit").show();
}

function zeroAdd(n) {
  if (n < 10) return "0" + n;
  else return n;
}

function tsChg(ts){
  var d = new Date(ts);
  var month = ["1월 ", "2월 ", "3월 ", "4월 ", "5월 ", "6월 ", "7월 ", "8월 ", "9월 ", "10월 ", "11월 ", "12월 "];
  var day = ["월", "화", "수", "목", "금", "토", "일"];
  var date = String(d.getFullYear()) + "년 " + month[d.getMonth()] + d.getDate() + "일 " + zeroAdd(d.getHours()) + ":" + zeroAdd(d.getMinutes()) + ":" + zeroAdd(d.getSeconds());

  return date;
}

/* ref = db.ref("root/gbook");
log("ref2: " + ref);
ref.push({ // insert
  content: "테스트",
  writer: "sungje5957",
  wtime: Date.now()
}).key; // push에 들어가는 방식은 javascript 객체방식으로 들어간다., key는 id값을 생성해달라는 의미.
 */

$("#save_bt").on("click", function () {
  var $content = $("#content");
  if ($content.val() == "") {
    alert("내용을 입력하세요.");
    $content.focus();
  } else {
    ref = db.ref("root/gbook/");
    ref.push({
      email: user.email,
      uid: user.uid,
      uname: user.displayName,
      content: $content.val(),
      wdate: Date.now()
    }).key;
    $content.val('');
  }
});

function onUpdate(obj) {
  key = $(obj).parent().parent().attr("id");
  var $target = $(obj).parent().prev();
  var v = $(obj).parent().prev().html();
  var html = '<input type="text" class="w3-input w3-show-inline-block w3-border w3-border-gray fl" style="width:calc(100% - 170px);" value="' + v + '">';
  html += '<button type="button" class="w3-button w3-red fr" onclick="onCancel(this, \' ' + v + ' \');">Cancel</button>';
  html += '<button type="button" class="w3-button w3-green fr" onclick="onUpdateDo(this);">Modify</button>'; // 역슬래쉬 활용.
  $target.html(html);
  $(obj).hide();
}

function onUpdateDo(obj) {
  var $input = $(obj).prev().prev();
  var content = $input.val();
  key = $(obj).parent().parent().attr("id");

  db.ref("root/gbook/" + key).update({
    content: content,
    wdate: Date.now()
  }); // 내가 지금 수정할 글
}

function onCancel(obj, val) {
  var $target = $(obj).parent().html(val);
  $target.parent().parent().find(".fa-edit").show();
}

function onDelete(obj) {
  key = $(obj).parent().parent().attr("id");
  if (confirm("Do you want to delete?")) {
    db.ref("root/gbook/" + key).remove(); // DB 삭제 remove
  }
}