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

  } else {
    user = null;
    $("#login_bt").show();
    $("#logout_bt").hide();
    $("#user_email").html('');
  }
}); // 이벤트에 callback을 붙인다.

/***** Database *****/
init();

function init() {
  ref = db.ref("root/gbook"); // root에 있는 gbook, 객체를 생성한 instance가 ref에 담긴 것.
  // log("ref1: " + ref);
  ref.on("child_added", onAdded) // child_added는 firebase에서 만들어놓은 event, ref의 데이터가 추가 된다면 실행
  // log("callback 대기중")
}

function onAdded(data) {
  // key와 value로 데이터에 접근
  var k = data.key;
  var v = data.val();

  log(data.key);
  log(data.val());

  var html = '<ul id="' + k + '" data-uid="' + v.uid + '" class="gbook">';
  html += '<li>' + v.uname + ' (' + v.email + ')</li>';
  html += '<li>' + v.content + '</li>';
  html += '<li>' + v.wdate + '</li>';
  html += '</ul>';

  $(".gbooks").prepend(html);

  // log("callback 실행")
  // log(data);
}; // 여기까지는 이벤트만 준비된 상태

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