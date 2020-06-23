var socket = io();
var current_user_id = "";
var active_msg_wrap_for = "";
var to_user_name = "";
var username = "";

function startConversionWithUser(e) {
  var to_id = $(e).attr("data-user");
  var from_id = current_user_id;
  active_msg_wrap_for = to_id;
  if ($(e).hasClass("newmessage")) {
    $(".newMessage_" + to_id).html("");
    $(e).removeClass("newmessage");
  }
  $(e).addClass("active").siblings().removeClass("active");
  $(".chat_with_user_name").empty();
  $(".msg-wrap").empty();
  $("#message-textarea").removeAttr("disabled");
  $("#message-sendbtn").removeAttr("disabled");
  $("#message-textarea").attr("data-message-to", to_id);
  $("#message-textarea").attr("data-message-from", from_id);

  var data = {};
  data.to_id = to_id;
  data.from_id = from_id;

  $.ajax("/api/getOneToOneChat", {
    type: "POST",
    data: data,

    success: function (res) {
      $(".chat_with_user_name").empty();
      var conversation_html = "";
      if (Object.keys(res.toUserInfo).length) {
        to_user_name = res.toUserInfo.displayName;
        to_user_image = res.toUserInfo.image;
        $(".chat_with_user_name").append(
          `<div class="conversationHead">${to_user_name} </div>`
        );
      }
      if (Object.keys(res.conversations).length) {
        res.conversations.forEach((conversation) => {
          let fromUsr = conversation.from_user;
          let toUsr = conversation.to_user;
          let nme = fromUsr._id == current_user_id ? "Me" : to_user_name;
          let message_send_by =
            nme == "Me" ? "message_send_by_me" : "message_send_by_other";
          let image =
            fromUsr._id === current_user_id ? fromUsr.image : to_user_image;
          let sent_on = moment(conversation.cratedAt).format("LT | dddd");
          let msg = conversation.message;
          conversation_html += `
        <div class="media msg">
        <a class="pull-left" href="#">
          <img class="media-object img-circle" data-src="holder.js/64x64" alt="64x64" style="width: 32px; height: 32px;" src=${image}>
        </a>
        <div class="media-body ${message_send_by}">
          <small class="pull-right time">${sent_on}</small>
          <h5 class="media-heading">${nme}</h5>
          <small class="col-lg-10">${$.emoticons.replace(msg)}</small>
        </div>
      </div>`;
        });
      } else {
        conversation_html = "No conversation found";
      }
      $(".msg-wrap").html(conversation_html);
    },
    error: (error) => {
      console.log("error:", error);
    },
  });
  chatBoxScrollDown();
}

function notifyTyping(e) {
  var notify_to = $(e).attr("data-message-to");
  var user = current_user_id;
  socket.emit("notifyUser", user, notify_to);
}

function chatBoxScrollDown() {
  $(".msg-wrap").animate(
    {
      scrollTop: $(".msg-wrap").get(0).scrollHeight,
    },
    2000
  );
}

function cutString(str) {
  var textstring = str.split(/\s+/).slice(0, 5).join(" ");

  return textstring + "...";
}

// socket.on("chatMessage", function (from, to, msg, sent_on) {
socket.on("chatMessage", function (chat, sent_on) {
  var message_html = "";
  let fromUser = chat.from_user;
  let toUser = chat.to_user;
  let msg = chat.message;
  var nme = fromUser._id == current_user_id ? "Me" : to_user_name;
  var message_send_by =
    nme == "Me" ? "message_send_by_me" : "message_send_by_other";
  if (current_user_id == fromUser._id) {
    $(".msg-wrap").append(
      `<div class="media msg">
            <a class="pull-left" href="#">
              <img class="media-object img-circle" data-src="holder.js/64x64" alt="64x64" style="width: 32px; height: 32px;" src=${
                fromUser.image
              }>
            </a>
            <div class="media-body ${message_send_by}">
              <small class="pull-right time">${sent_on}</small>
              <h5 class="media-heading">${nme}</h5>
              <small class="col-lg-10">${$.emoticons.replace(msg)}</small>
            </div>
          </div>`
    );
    chatBoxScrollDown();
  } else if (active_msg_wrap_for == fromUser._id) {
    if (toUser._id == current_user_id) {
      $(".msg-wrap").append(
        `<div class="media msg">
        <a class="pull-left" href="#">
          <img class="media-object img-circle" data-src="holder.js/64x64" alt="64x64" style="width: 32px; height: 32px;" src=${
            toUser.image
          }>
        </a>
        <div class="media-body ${message_send_by}">
          <small class="pull-right time">${sent_on}</small>
          <h5 class="media-heading">${nme}</h5>
          <small class="col-lg-10">${$.emoticons.replace(msg)}</small>
        </div>
      </div>`
      );
      chatBoxScrollDown();
    }
  } else if (toUser._id == current_user_id) {
    var user = parseInt(fromUser._id);
    $(".conversation").each(function (index, value) {
      if ($(value).data("user") == user) {
        if ($(".newMessage_" + user).is(":empty")) {
          $(".notifyTyping_" + user).empty();
          $(value).addClass("newmessage");
          $(".newMessage_" + user).html(
            "<b>" + $.emoticons.replace(cutString(msg)) + "</b>"
          );
        }
      }
    });
  }
});

socket.on("notifyUser", function (user, notify_to) {
  if (notify_to == current_user_id) {
    var me = current_user_id;
    if (user != me) {
      $(".conversation").each(function (i, v) {
        if ($(v).data("user") === user) {
          if ($(".notifyTyping_" + user).is(":empty")) {
            $(".notifyTyping_" + user).html("<b>typing...</b>");
          }
        }
      });
    }
    setTimeout(function () {
      $(".notifyTyping_" + user).html("");
    }, 10000);
  }
});

socket.on("wallstatusPost", function (user, msg, sent_on) {
  let username = user.displayName;
  let profilePic = user.image;
  $(".wall-post-wrap").append(
    `<div class="panel panel-primary">
        <div class="panel-heading">
          <h3 class="panel-title">${username} 
            <small class="pull-right time"> ${sent_on} </small>
          </h3>
        </div>
        <div class="panel-body">
          <div class="media msg">
            <a class="pull-left" href="#">
              <img class="media-object img-circle"  data-src="holder.js/64x64" alt="64x64" style="width: 32px; height: 32px;" src=${profilePic}}></a>
                <div class="media-body"><small class="col-lg-10">
                  ${$.emoticons.replace(msg)} 
                  </small>
                </div>
              </div>
            </div>
          </div>`
  );
});

$(document).ready(function () {
  getWallStatusPost();
  getAllUsers();
  setInterval(function () {
    getWallStatusPost();
  }, 10000);

  var definition = {
    smile: { title: "Smile", codes: [":)", ":=)", ":-)"] },
    "sad-smile": { title: "Sad Smile", codes: [":(", ":=(", ":-("] },
    "big-smile": {
      title: "Big Smile",
      codes: [":D", ":=D", ":-D", ":d", ":=d", ":-d"],
    },
    cool: {
      title: "Cool",
      codes: ["8)", "8=)", "8-)", "B)", "B=)", "B-)", "(cool)"],
    },
    wink: { title: "Wink", codes: [":o", ":=o", ":-o", ":O", ":=O", ":-O"] },
    crying: { title: "Crying", codes: [";(", ";-(", ";=("] },
    sweating: { title: "Sweating", codes: ["(sweat)", "(:|"] },
    speechless: { title: "Speechless", codes: [":|", ":=|", ":-|"] },
    kiss: { title: "Kiss", codes: [":*", ":=*", ":-*"] },
    "tongue-out": {
      title: "Tongue Out",
      codes: [":P", ":=P", ":-P", ":p", ":=p", ":-p"],
    },
    blush: { title: "Blush", codes: ["(blush)", ":$", ":-$", ":=$", ':">'] },
    wondering: { title: "Wondering", codes: [":^)"] },
    sleepy: { title: "Sleepy", codes: ["|-)", "I-)", "I=)", "(snooze)"] },
    dull: { title: "Dull", codes: ["|(", "|-(", "|=("] },
    "in-love": { title: "In love", codes: ["(inlove)"] },
    "evil-grin": { title: "Evil grin", codes: ["]:)", ">:)", "(grin)"] },
    talking: { title: "Talking", codes: ["(talk)"] },
    yawn: { title: "Yawn", codes: ["(yawn)", "|-()"] },
    puke: { title: "Puke", codes: ["(puke)", ":&", ":-&", ":=&"] },
    "doh!": { title: "Doh!", codes: ["(doh)"] },
    angry: {
      title: "Angry",
      codes: [":@", ":-@", ":=@", "x(", "x-(", "x=(", "X(", "X-(", "X=("],
    },
    "it-wasnt-me": { title: "It wasn't me", codes: ["(wasntme)"] },
    party: { title: "Party!!!", codes: ["(party)"] },
    worried: {
      title: "Worried",
      codes: [":S", ":-S", ":=S", ":s", ":-s", ":=s"],
    },
    mmm: { title: "Mmm...", codes: ["(mm)"] },
    nerd: {
      title: "Nerd",
      codes: ["8-|", "B-|", "8|", "B|", "8=|", "B=|", "(nerd)"],
    },
    "lips-sealed": {
      title: "Lips Sealed",
      codes: [":x", ":-x", ":X", ":-X", ":#", ":-#", ":=x", ":=X", ":=#"],
    },
    hi: { title: "Hi", codes: ["(hi)"] },
    call: { title: "Call", codes: ["(call)"] },
    devil: { title: "Devil", codes: ["(devil)"] },
    angel: { title: "Angel", codes: ["(angel)"] },
    envy: { title: "Envy", codes: ["(envy)"] },
    wait: { title: "Wait", codes: ["(wait)"] },
    bear: { title: "Bear", codes: ["(bear)", "(hug)"] },
    "make-up": { title: "Make-up", codes: ["(makeup)", "(kate)"] },
    "covered-laugh": {
      title: "Covered Laugh",
      codes: ["(giggle)", "(chuckle)"],
    },
    "clapping-hands": { title: "Clapping Hands", codes: ["(clap)"] },
    thinking: { title: "Thinking", codes: ["(think)", ":?", ":-?", ":=?"] },
    bow: { title: "Bow", codes: ["(bow)"] },
    rofl: { title: "Rolling on the floor laughing", codes: ["(rofl)"] },
    whew: { title: "Whew", codes: ["(whew)"] },
    happy: { title: "Happy", codes: ["(happy)"] },
    smirking: { title: "Smirking", codes: ["(smirk)"] },
    nodding: { title: "Nodding", codes: ["(nod)"] },
    shaking: { title: "Shaking", codes: ["(shake)"] },
    punch: { title: "Punch", codes: ["(punch)"] },
    emo: { title: "Emo", codes: ["(emo)"] },
    yes: { title: "Yes", codes: ["(y)", "(Y)", "(ok)"] },
    no: { title: "No", codes: ["(n)", "(N)"] },
    handshake: { title: "Shaking Hands", codes: ["(handshake)"] },
    skype: { title: "Skype", codes: ["(skype)", "(ss)"] },
    heart: { title: "Heart", codes: ["(h)", "<3", "(H)", "(l)", "(L)"] },
    "broken-heart": { title: "Broken heart", codes: ["(u)", "(U)"] },
    mail: { title: "Mail", codes: ["(e)", "(m)"] },
    flower: { title: "Flower", codes: ["(f)", "(F)"] },
    rain: { title: "Rain", codes: ["(rain)", "(london)", "(st)"] },
    sun: { title: "Sun", codes: ["(sun)"] },
    time: { title: "Time", codes: ["(o)", "(O)", "(time)"] },
    music: { title: "Music", codes: ["(music)"] },
    movie: { title: "Movie", codes: ["(~)", "(film)", "(movie)"] },
    phone: { title: "Phone", codes: ["(mp)", "(ph)"] },
    coffee: { title: "Coffee", codes: ["(coffee)"] },
    pizza: { title: "Pizza", codes: ["(pizza)", "(pi)"] },
    cash: { title: "Cash", codes: ["(cash)", "(mo)", "($)"] },
    muscle: { title: "Muscle", codes: ["(muscle)", "(flex)"] },
    cake: { title: "Cake", codes: ["(^)", "(cake)"] },
    beer: { title: "Beer", codes: ["(beer)"] },
    drink: { title: "Drink", codes: ["(d)", "(D)"] },
    dance: { title: "Dance", codes: ["(dance)", "o/", ":D/", ":d/"] },
    ninja: { title: "Ninja", codes: ["(ninja)"] },
    star: { title: "Star", codes: ["(*)"] },
    mooning: { title: "Mooning", codes: ["(mooning)"] },
    finger: { title: "Finger", codes: ["(finger)"] },
    bandit: { title: "Bandit", codes: ["(bandit)"] },
    drunk: { title: "Drunk", codes: ["(drunk)"] },
    smoking: { title: "Smoking", codes: ["(smoking)", "(smoke)", "(ci)"] },
    toivo: { title: "Toivo", codes: ["(toivo)"] },
    rock: { title: "Rock", codes: ["(rock)"] },
    headbang: { title: "Headbang", codes: ["(headbang)", "(banghead)"] },
    bug: { title: "Bug", codes: ["(bug)"] },
    fubar: { title: "Fubar", codes: ["(fubar)"] },
    poolparty: { title: "Poolparty", codes: ["(poolparty)"] },
    swearing: { title: "Swearing", codes: ["(swear)"] },
    tmi: { title: "TMI", codes: ["(tmi)"] },
    heidy: { title: "Heidy", codes: ["(heidy)"] },
    myspace: { title: "MySpace", codes: ["(MySpace)"] },
    malthe: { title: "Malthe", codes: ["(malthe)"] },
    tauri: { title: "Tauri", codes: ["(tauri)"] },
    priidu: { title: "Priidu", codes: ["(priidu)"] },
  };
  $.emoticons.define(definition);

  $("#wallStatusPost").submit(function (event) {
    event.preventDefault();
    var message = $("#statusText").val();
    if (message != "") {
      socket.emit("wallstatusPost", message);
    }
    $("#statusText").val("").focus();
    return false;
  });

  $("#sendmessage").submit(function (event) {
    event.preventDefault();
    var from = $("#message-textarea").attr("data-message-from");
    var to = $("#message-textarea").attr("data-message-to");
    var message = $("#message-textarea").val();
    if (message != "") {
      socket.emit("chatMessage", from, to, message);
    }
    $("#message-textarea").val("").focus();

    //alert("Message From = "+from+" sendTo ="+to+" Message ="+message);
    return false;
  });
});

function getAllUsers() {
  $.ajax("/api/getAllUsers", {
    type: "POST",
    success: function (res) {
      var html = "";
      var status = "online";
      if (res.userLists.length > 0) {
        current_user_id = res.currentUserInfo._id;
        let userLists = res.userLists;
        userLists.forEach((user) => {
          html += `
          <div class="media conversation" onclick="startConversionWithUser(this)" data-user =${user._id}>
            <a class="pull-left" href="#">
              <img class="media-object img-circle " data-src="holder.js/64x64" alt="64x64" style="width: 50px; height: 50px;" src=${user.image}>
            </a>
            <div class="media-body">
              <h5 class="media-heading">${user.displayName}</h5>
              <span class=${status}></span>
              <span class="notifyTyping_${user._id}"/>
              <span class="newMessage_${user._id}"/>
            </div>
          </div>
          `;
        });
        $(".conversation-wrap").html(html);
      } else {
        html = "<li>No Users Found</li>";
        $(".conversation-wrap").html(html);
      }
    },
    error: (error) => {
      console.log("error:", error);
    },
  });
}

function getWallStatusPost() {
  $("#dashboardLoader").show();
  $.ajax("/api/getWallStatusPost", {
    type: "GET",
    success: function (res) {
      var html = "";
      if (res.length > 0) {
        res.forEach((post) => {
          let username = post.user.displayName;
          let profilePic =
            typeof post.user.image != "undefined"
              ? post.user.image
              : "/image/avatar.png";
          let sent_on = moment(post.cratedAt).format("LT | dddd");
          html += `<div class="panel panel-primary">
          <div class="panel-heading">
            <h3 class="panel-title">${username} 
              <small class="pull-right time"> ${sent_on} </small>
            </h3>
          </div>
          <div class="panel-body">
            <div class="media msg">
              <a class="pull-left" href="#">
                <img class="media-object img-circle"  data-src="holder.js/64x64" alt="64x64" style="width: 32px; height: 32px;" src=${profilePic}}></a>
                  <div class="media-body"><small class="col-lg-10">
                    ${$.emoticons.replace(post.pastDescription)} 
                    </small>
                  </div>
                </div>
              </div>
            </div>`;
        });
        $(".wall-post-wrap").html(html);
      } else {
        html = "<li>No Status Available.</li>";
        $(".wall-post-wrap").html(html);
      }
      $("#dashboardLoader").hide();
    },
    error: function (error) {
      $("#dashboardLoader").hide();
      console.log("error=:", error);
    },
  });
}
