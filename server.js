const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const convertDatesToSaudi = require("./middlewares/saudiTimeZoneMiddleware");

const cloudinary_connection = require("./config/cloudinary");
const globalErorr = require("./middlewares/erorrMiddlewares");
const db_MongoDB = require("./config/database");
const DepartmentRoutes = require("./routes/departmentRoutes");
const productRoutes = require("./routes/productRoutes");
const productOPRoutes = require("./routes/productOPRoutes");
const userRoutes = require("./routes/userRoutes");
const ApiErrors = require("./utils/apiErrors");
const authRoutes = require("./routes/authRoutes");
const SupplierRoutes = require("./routes/supplierRoutes");
const UnitRoutes = require("./routes/unitRoutes");
const emaillerRoutes = require("./routes/emaillerRoute");
const TransactionRoutes = require("./routes/transactionRoutes");
const MainProductRoutes = require("./routes/mainProductRoutes");
const FatwraRoutes = require("./routes/fatwraRoutes");
const BranchRoutes = require("./routes/branchRoutes");
const OrderProductionRoutes = require("./routes/orderProductionRoutes");
const orderSupplyRoutes = require("./routes/orderSupplyRoutes");
const MainProductOPRoutes = require("./routes/mainProductOPRoutes");
const ProductionRoutes = require("./routes/productionRoutes");
const productionSupplyRoutes = require("./routes/productionSupplyRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const sendProcesRoutes = require("./routes/SendProcessRoutes");
const tawalfRoutes = require("./routes/tawalfRoutes");
const failedLoginRoutes = require("./routes/failedLoginRoutes");
const productcasherRezoRoutes = require("./routes/productcasherRezoRoutes");
const rezoCasherRoutes = require("./routes/rezoCasherRoutes");
const deliveryAppRoutes = require("./routes/deliveryAppRoutes");
const mixProductRoutes = require("./routes/mixProductRoutes");
const mixedRoutes = require("./routes/mixedRoutes");
const finalMixedRoutes = require("./routes/finalMixedRoutes");
const levelRoutes =require("./routes/levelRoutes");
const cors = require("cors");
const compression = require("compression");
const missionRoutes =require("./routes/missionRoutes");
const {UserModel} = require("./models/userModel");
const walaaHistoryRoutes =require("./routes/walaaHistoryRoutes");
const rewardsRoutes =require("./routes/rewardsRoutes");
const categoryRoutes =require("./routes/categoryRoutes");
const app = express();
const basepathApi = "/api";

//Mode Connections
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// database connection
db_MongoDB();
cloudinary_connection();

// middleware
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(compression());
// app.use(convertDatesToSaudi);

// Routes
app.use(`${basepathApi}/users`, userRoutes);
app.use(`${basepathApi}/auth`, authRoutes);
app.use(`${basepathApi}/department`, DepartmentRoutes);
app.use(`${basepathApi}/supplier`, SupplierRoutes);
app.use(`${basepathApi}/unit`, UnitRoutes);
app.use(`${basepathApi}/product`, productRoutes);
app.use(`${basepathApi}/productOP`, productOPRoutes);
app.use(`${basepathApi}/transaction`, TransactionRoutes);
app.use(`${basepathApi}/email`, emaillerRoutes);
app.use(`${basepathApi}/mainProduct`, MainProductRoutes);
app.use(`${basepathApi}/mainProductOP`, MainProductOPRoutes);
app.use(`${basepathApi}/fatwra`, FatwraRoutes);
app.use(`${basepathApi}/branch`, BranchRoutes);
app.use(`${basepathApi}/orderProduction`, OrderProductionRoutes);
app.use(`${basepathApi}/Production`, ProductionRoutes);
app.use(`${basepathApi}/orderSupply`, orderSupplyRoutes);
app.use(`${basepathApi}/ProductionSupply`, productionSupplyRoutes);
app.use(`${basepathApi}/settings`,settingsRoutes );
app.use(`${basepathApi}/sendProcess`,sendProcesRoutes );
app.use(`${basepathApi}/tawalf`,tawalfRoutes );
app.use(`${basepathApi}/failedDevices`, failedLoginRoutes);
app.use(`${basepathApi}/productcasherRezo`,productcasherRezoRoutes );
app.use(`${basepathApi}/rezoCasher`,rezoCasherRoutes );
app.use(`${basepathApi}/deliveryApp`,deliveryAppRoutes)
app.use(`${basepathApi}/mixproduct`,mixProductRoutes)
app.use(`${basepathApi}/mixed`,mixedRoutes)
app.use(`${basepathApi}/finalMixed`,finalMixedRoutes)
app.use(`${basepathApi}/level`,levelRoutes)
app.use(`${basepathApi}/misson`,missionRoutes)
app.use(`${basepathApi}/walaaHistory`,walaaHistoryRoutes)
app.use(`${basepathApi}/rewards`,rewardsRoutes)
app.use(`${basepathApi}/category`,categoryRoutes)
// errors
app.all("*", (req, res, next) => {
  next(new ApiErrors(`Can't found the url ${req.originalUrl}`, 400));
});
app.use(globalErorr);

// 🟢 Socket.IO setup
const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // في البروडकشن حط دومينك بدل النجمة
  },
});

let onlineUsers = {};

// عند الاتصال
io.on("connection", (socket) => {
  console.log("✅ مستخدم اتصل:", socket.id);

  socket.on("setUserOnline", async (userId) => {
    try {
      onlineUsers[userId] = socket.id;

      // حدّث الداتا بيز
      await UserModel.findByIdAndUpdate(userId, { 
        isOnline: true, 
        lastSeen: new Date() 
      });

      // رجّع للي متصلين دلوقتي
      const users = await UserModel.find({ isOnline: true }).select("name email");
      io.emit("updateOnlineUsers", users);

      console.log("📌 Online Users:", Object.keys(onlineUsers));
    } catch (err) {
      console.error("❌ Error setting user online:", err.message);
    }
  });

  socket.on("disconnect", async () => {
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );

    if (userId) {
      delete onlineUsers[userId];

      try {
        await UserModel.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        });

        const users = await UserModel.find({ isOnline: true }).select("name email");
        io.emit("updateOnlineUsers", users);

        console.log("❌ مستخدم خرج:", userId);
      } catch (err) {
        console.error("❌ Error setting user offline:", err.message);
      }
    }
  });
});

// تشغيل السيرفر
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (error) => {
  console.error(`unhandledRejection Error : ${error.name} || ${error.message}`);
  server.close(() => {
    console.error(`Shutting Down Server...`);
    process.exit(1);
  });
});
