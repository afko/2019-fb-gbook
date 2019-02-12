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

/***** Auth *****/
$("#login_bt").on("click", function () {
  auth.signInWithPopup(googleAuth); // 팝업창 띄워서 구글 로그인
  // auth.signInWithRedirect();
});

$("#logout_bt").on("click",function(){
  auth.signOut();
})

// callback개념으로 구현, 이벤트만 붙이면 된다.
auth.onAuthStateChanged(function (result) {
  if (result) {

    var email = '<img src="' + result.photoURL + '" style="width:36px; border-radius:70%;"> ' + result.email;

    $("#login_bt").hide();
    $("#logout_bt").show();
    $("#user_email").html(email);

  } else {
    $("#login_bt").show();
    $("#logout_bt").hide();
    $("#user_email").html('');
  }
}); // 이벤트에 callback을 붙인다.'