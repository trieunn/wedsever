//////////////////////CẤU HÌNH KẾT NỐI KEPWARE////////////////////
const { TagBuilder, IotGateway } = require("kepserverex-js");
const tagBuilder = new TagBuilder({ namespace: "Channel1.Device1" });
const iotGateway = new IotGateway({
  host: "127.0.0.1",
  port: 5000,
});

/////////////HÀM ĐỌC/GHI DỮ LIỆU XUỐNG KEPWARE(PLC)//////////////
//Đọc dữ liệu
var tagArr = [];
function fn_tagRead() {
  iotGateway.read(TagList).then((data) => {
    var lodash = require("lodash");
    tagArr = lodash.map(data, (item) => item.v);
    console.log(tagArr);
  });
}
// Ghi dữ liệu
function fn_Data_Write(tag, data) {
  tagBuilder.clean();
  const set_value = tagBuilder.write(tag, data).get();
  iotGateway.write(set_value);
}

///////////////////////////ĐỊNH NGHĨA TAG////////////////////////
// Khai báo tag
var tag_Bool = "tag_Bool";
var tag_Integer = "tag_Integer";
var tag_Real = "tag_Real";

// Đọc dữ liệu
const TagList = tagBuilder
  .read(tag_Bool)
  .read(tag_Integer)
  .read(tag_Real)
  .get();

///////////////////////////QUÉT DỮ LIỆU////////////////////////
// Tạo Timer quét dữ liệu
setInterval(
  () => fn_read_data_scan(),
  1000 //100ms = 1s
);

// Quét dữ liệu
function fn_read_data_scan() {
  fn_tagRead(); // Đọc giá trị tag
}

// /////////////////////////THIẾT LẬP KẾT NỐI WEB/////////////////////////
var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);
// Home calling
app.get("/", function (req, res) {
  res.render("home");
});
//

// ///////////TRUYỀN NHẬN DỮ LIỆU VỚI TRÌNH DUYỆT WEB///////////////////
io.on("connection", function (socket) {
  // Bật tắt động cơ M1
  socket.on("Client-send-cmdM1", function (data) {
    fn_Data_Write(tag_Bool, data);
  });
});

// ///////////LẬP BẢNG TAG ĐỂ GỬI QUA CLIENT (TRÌNH DUYỆT)///////////
function fn_tag() {
  io.sockets.emit("tag_Bool", tagArr[0]);
  io.sockets.emit("tag_Integer", tagArr[1]);
  io.sockets.emit("tag_Real", tagArr[2]);
}
// ///////////GỬI DỮ LIỆU BẢNG TAG ĐẾN CLIENT (TRÌNH DUYỆT)///////////
io.on("connection", function (socket) {
  socket.on("Client-send-data", function (data) {
    fn_tag();
  });
});
