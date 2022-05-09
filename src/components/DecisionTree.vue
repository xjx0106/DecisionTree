<template>
  <div class="component-container">
    <div
      class="decision-tree"
      id="treeGraphContainer"
      ref="treeGraphContainer"
    ></div>
    <!-- 新增/編輯對話框 -->
    <el-dialog
      :title="operateDialogData.dialogTitle"
      :visible.sync="operateDialogVisible"
      width="500"
      class="detail-dialog"
      :close-on-click-modal="false"
    >
      <div class="detail-dialog-content">
        <el-form ref="form" :model="operateDialogData" label-width="80px">
          <el-form-item label="节点类型">
            <el-radio-group v-model="operateDialogData.decisionType">
              <el-radio-button label="parameter">参数节点</el-radio-button>
              <el-radio-button label="compare">对比节点</el-radio-button>
              <el-radio-button label="action">动作节点</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- 參數類型的節點 -->
          <div v-if="operateDialogData.decisionType === 'parameter'">
            <el-form-item label="参数类型">
              <el-select
                v-model="operateDialogData.parameter.valueType"
                placeholder="请选择参数类型"
              >
                <el-option
                  v-for="item in valueTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <!-- 各種類型的參數 -->
            <el-form-item
              label="变量值"
              v-if="operateDialogData.parameter.valueType === 'variable'"
            >
              <el-select
                v-model="operateDialogData.parameter.value"
                placeholder="请选择变量"
              >
                <el-option
                  v-for="item in variableList"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="输入值"
              v-if="operateDialogData.parameter.valueType === 'input'"
            >
              <el-input v-model="operateDialogData.parameter.value"></el-input>
            </el-form-item>
            <el-form-item
              label="常量"
              v-if="operateDialogData.parameter.valueType === 'constant'"
            >
              <el-select
                v-model="operateDialogData.parameter.value"
                placeholder="请选择常量"
              >
                <el-option
                  v-for="item in constantList"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
            </el-form-item>
          </div>

          <!-- 比較類型的節點 -->
          <div v-if="operateDialogData.decisionType === 'compare'">
            <el-form-item label="比较符">
              <el-select
                v-model="operateDialogData.compare.method"
                placeholder="请选择比较符"
              >
                <el-option
                  v-for="item in compareList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="参数类型">
              <el-select
                v-model="operateDialogData.compare.valueType"
                placeholder="请选择参数类型"
              >
                <el-option
                  v-for="item in valueTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <!-- 各種類型的參數 -->
            <el-form-item
              label="变量值"
              v-if="operateDialogData.compare.valueType === 'variable'"
            >
              <el-select
                v-model="operateDialogData.compare.value"
                placeholder="请选择变量"
              >
                <el-option
                  v-for="item in variableList"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="输入值"
              v-if="operateDialogData.compare.valueType === 'input'"
            >
              <el-input v-model="operateDialogData.compare.value"></el-input>
            </el-form-item>
            <el-form-item
              label="常量"
              v-if="operateDialogData.compare.valueType === 'constant'"
            >
              <el-select
                v-model="operateDialogData.compare.value"
                placeholder="请选择常量"
              >
                <el-option
                  v-for="item in constantList"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
            </el-form-item>
          </div>

          <!-- 動作類型的節點 -->
          <div v-if="operateDialogData.decisionType === 'action'">
            <el-form-item label="动作">
              <el-select
                v-model="operateDialogData.action.value"
                placeholder="请选择动作"
              >
                <el-option
                  v-for="item in actionList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="operateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveDetail">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */

import G6 from "@antv/g6";
import insertCss from "insert-css";

import mockData from "./mockData.js";
import mockData2 from "./mockData2.js";

import { uuid } from "./../utils/index.js";

export default {
  name: "DecisionTree",
  data() {
    return {
      // 圖譜相關的數據
      graph: null,
      defaultConfig: {
        width: 1200,
        height: 800,
        modes: {
          default: ["zoom-canvas", "drag-canvas"],
        },
        fitView: false,
        animate: true,
        defaultNode: {
          type: "flow-rect",
        },
        defaultEdge: {
          type: "cubic-horizontal",
          style: {
            stroke: "rgba(0, 0, 0, 0.27)", // 邊的顔色
          },
        },
        layout: {
          type: "indented",
          direction: "LR",
          dropCap: false, // 子節點在父節點的下一行
          indent: 220, // 左右兩個節點之間的距離（橫向的）
          getHeight: () => {
            return 0;
          }, // 上下兩個節點之間的距離（竪向的）
        },
      },
      props: {
        config: {
          padding: [20, 50],
          defaultLevel: 3,
          defaultZoom: 0.8,
          modes: { default: ["zoom-canvas", "drag-canvas"] },
        },
      },
      // 對話框相關的數據
      operateDialogVisible: false,
      operateDialogData: {
        dialogTitle: "新增",
        id: "", // 編輯時：那個節點的id；新增時：父親節點的id
        decisionType: "", // parameter, compare, action
        parameter: {
          // 參數類型的節點
          valueType: "", // 參數的類型(variable/input/constant)
          value: null, // 參數的值
        },
        compare: {
          // 比較類型的節點
          method: "", // 比較操作符("bigger")
          valueType: "", // 參數的類型(variable/input/constant)
          value: null, // 參數的值
        },
        action: {
          // 動作類型的節點
          value: "",
        },
      },
      // 比較操作符的列表
      compareList: [
        { value: "bigger", label: "＞" },
        { value: "bigger_equal", label: "＞=" },
        { value: "equal", label: "=" },
        { value: "smaller", label: "＜" },
        { value: "smaller_equal", label: "＜=" },
        { value: "not_equal", label: "!=" },
      ],
      // 值類型的列表
      valueTypeList: [
        { value: "variable", label: "变量" },
        { value: "input", label: "输入值" },
        { value: "constant", label: "常量" },
      ],
      // 變量的列表
      variableList: ["姓名", "年龄", "月收入", "年收入", "性别"],
      // 常量的列表
      constantList: ["普通额度10万", "税率10%"],
      // 動作的列表
      actionList: [
        { label: "禁止", value: "action1" },
        { label: "禁用", value: "action2" },
        { label: "删除", value: "action3" },
        { label: "标记为高风险", value: "action4" },
      ],
      // 三種節點的類型
      // parameter/compare/action
    };
  },
  created() {
    insertCss(`
      .g6-component-tooltip {
        background-color: rgba(0,0,0, 0.65);
        padding: 10px;
        box-shadow: rgb(174, 174, 174) 0px 0px 10px;
        width: fit-content;
        color: #fff;
        border-radius = 4px;
      }
    `);
  },
  watch: {
    operateDialogVisible: {
      handler(val) {
        if (!val) {
          ({ operateDialogData: this.operateDialogData } =
            this.$options.data());
        }
      },
    },
  },
  mounted() {
    this.registerFn();

    const tgContainer = this.$refs["treeGraphContainer"];
    const width = tgContainer.scrollWidth;
    // const height = tgContainer.scrollHeight || 500;
    this.defaultConfig.width = width;
    this.defaultConfig.height = 800;

    this.initGraph(mockData2);

    // if (typeof window !== "undefined")
    //   window.onresize = () => {
    //     console.log("resize");
    //     // eslint-disable-next-line no-debugger
    //     if (!this.graph || this.graph.get("destroyed")) return;
    //     if (!container || !container.scrollWidth || !container.scrollHeight)
    //       return;
    //     this.graph.changeSize(container.scrollWidth, container.scrollHeight);
    //   };
    this.graphFitCenter();
  },
  methods: {
    /**
     * 自定義節點、邊
     */
    registerFn() {
      const colors = {
        B: "#5B8FF9",
        R: "#F46649",
        Y: "#EEBC20",
        G: "#5BD8A6",
        DI: "#A7A7A7",
      };

      const compareList = this.compareList;
      const actionList = this.actionList;
      /**
       * 自定義節點
       */
      G6.registerNode(
        "flow-rect",
        {
          shapeType: "flow-rect",
          draw(cfg, group) {
            const {
              id,
              collapsed,
              decisionType, // 決策節點類型: parameter/compare/action
              decisionData, // 決策節點的值
            } = cfg;

            /**
             * 基礎方塊配置
             */
            const rectConfig = {
              width: 185,
              height: 30,
              lineWidth: 1,
              fontSize: 12,
              fill: "#fff",
              radius: 4,
              stroke: "rgba(0, 0, 0, 0.27)", // grey 基礎方塊的邊框顔色
              opacity: 1,
            };

            /**
             * X:0,Y:0是rectConfig（基礎方塊）的中心點，所以這個點是基礎方塊的左上角
             */
            const nodeOrigin = {
              x: -rectConfig.width / 2,
              y: -rectConfig.height / 2,
            };

            // 文字類元素的基礎配置
            const textConfig = {
              textAlign: "left",
              textBaseline: "bottom",
            };

            const rect = group.addShape("rect", {
              attrs: {
                x: nodeOrigin.x,
                y: nodeOrigin.y,
                ...rectConfig,
              },
            });
            const rectBBox = rect.getBBox();

            /**
             * 大標題
             */
            // const nameShow = decisionData.value || "";
            // const bigTitle = group.addShape("text", {
            //   attrs: {
            //     ...textConfig,
            //     x: 18 + nodeOrigin.x,
            //     y: 22 + nodeOrigin.y,
            //     text:
            //       nameShow.length > 20
            //         ? nameShow.substr(0, 20) + "..."
            //         : nameShow,
            //     fontSize: 12,
            //     opacity: 0.85,
            //     fill: "#000",
            //     cursor: "pointer",
            //   },
            //   name: "name-element",
            // });

            if (decisionType === "parameter") {
              // 參數

              const nameShow = decisionData.parameter.value || "";
              /**
               * 參數的標題
               */
              const parameterTitle = group.addShape("text", {
              attrs: {
                ...textConfig,
                  x: 13 + nodeOrigin.x,
                  y: nodeOrigin.y + 16,
                  text:
                    nameShow.length > 20
                      ? nameShow.substr(0, 20) + "..."
                      : nameShow,
                  fontSize: 14,
                  fontWeight: "Bold",
                  textBaseline: "middle",
                  opacity: 0.9,
                  fill: "#188cff",
                cursor: "pointer",
              },
              name: "name-element",
            });
            } else if (decisionType === "compare") {
              // 條件

              const conObj = compareList.find(
                (liI) => liI.value === decisionData.compare.method // "bigger"
              );
              let conMarkShow = "no compare mark";
              if (conObj) {
                conMarkShow = conObj.label;
              }
              /**
               * 條件的比較符
               */
              const condition = group.addShape("text", {
                attrs: {
                  ...textConfig,
                  x: 7 + nodeOrigin.x,
                  y: nodeOrigin.y + 16,
                  text:
                    conMarkShow.length > 20
                      ? conMarkShow.substr(0, 20) + "..."
                      : conMarkShow,
                  fontSize: 14,
                  textBaseline: "middle",
                  fontWeight: "Bold",
                  opacity: 0.9,
                  fill: "#F56C6C",
                  cursor: "pointer",
                },
                // name: "name-element",
              });

              /**
               * 條件的比較内容
               */
              const comparisonValue = group.addShape("text", {
                attrs: {
                  ...textConfig,
                  x: 40 + nodeOrigin.x,
                  y: nodeOrigin.y + 16,
                  text:
                    decisionData.compare.value.length > 20
                      ? decisionData.compare.value.substr(0, 20) + "..."
                      : decisionData.compare.value,
                  fontSize: 14,
                  textBaseline: "middle",
                  fontWeight: "Bold",
                  opacity: 0.9,
                  fill: "#67C23A",
                  cursor: "pointer",
                },
                // name: "name-element",
              });
            } else if (decisionType === "action") {
              // 動作
              /**
               * 動作的名字
               */
              let nameShow = "no action name";
              const actionValue = decisionData.action.value || "";
              const actionItem = actionList.find(
                (ac) => ac.value === actionValue
              );
              if (actionItem) {
                nameShow = actionItem.label;
              }
              const actionName = group.addShape("text", {
                attrs: {
                  ...textConfig,
                  x: 13 + nodeOrigin.x,
                  y: nodeOrigin.y + 16,
                  text:
                    nameShow.length > 20
                      ? nameShow.substr(0, 20) + "..."
                      : nameShow,
                  fontSize: 14,
                  fontWeight: "Bold",
                  textBaseline: "middle",
                  opacity: 0.9,
                  fill: "#E6A23C",
                  cursor: "pointer",
                },
                name: "action-element",
              });
            }

            // 設置齒輪按鈕
            group.addShape("image", {
              attrs: {
                ...textConfig,
                width: 16.6,
                height: 16.6,
                fontSize: 12,
                img: require("../assets/image/setting.svg"),
                x: 110 + nodeOrigin.x,
                y: nodeOrigin.y + 6.3,
                cursor: "pointer",
                opacity: 0.4,
              },
              name: "setting-element",
            });

            // 設置新增按鈕
            group.addShape("image", {
              attrs: {
                ...textConfig,
                width: 20.6,
                height: 20.6,
                fontSize: 12,
                img: require("../assets/image/add.svg"),
                x: 130 + nodeOrigin.x,
                y: nodeOrigin.y + 4.3,
                cursor: "pointer",
                opacity: 1,
              },
              name: "add-element",
            });

            // 設置刪除按鈕
            group.addShape("image", {
              attrs: {
                ...textConfig,
                width: 20.6,
                height: 20.6,
                fontSize: 12,
                img: require("../assets/image/close.svg"),
                x: 150 + nodeOrigin.x,
                y: nodeOrigin.y + 4,
                cursor: id === "g1" ? "default" : "pointer",
                opacity: id === "g1" ? 0 : 1,
              },
              name: "delete-element",
            });

            // // 三角形
            // group.addShape("marker", {
            //   attrs: {
            //     ...textConfig,
            //     x: nodeOrigin.x + 10,
            //     y: bigTitle.getBBox().y + 4,
            //     symbol: variableUp ? "triangle" : "triangle-down",
            //     r: 6,
            //     fill: colors[status],
            //   },
            // });

            // 加減號-展開收縮按鈕
            if (cfg.children && cfg.children.length) {
              // 正方形
              group.addShape("rect", {
                attrs: {
                  x: rectConfig.width / 2 - 8,
                  y: -8,
                  width: 16,
                  height: 16,
                  stroke: "rgba(0, 0, 0, 0.35)",
                  cursor: "pointer",
                  fill: "#fff",
                  radius: 3,
                },
                name: "collapse-back",
                modelId: cfg.id,
              });
              // 加減號
              group.addShape("text", {
                attrs: {
                  x: rectConfig.width / 2,
                  y: 1,
                  textAlign: "center",
                  textBaseline: "middle",
                  text: collapsed ? "+" : "-",
                  fontSize: 16,
                  // fontWeight: "bold",
                  cursor: "pointer",
                  fill: "rgba(0, 0, 0, 0.35)",
                },
                name: "collapse-text",
                modelId: cfg.id,
              });
            }

            this.drawLinkPoints(cfg, group);
            return rect;
          },
          /**
           * @param cfg 這裏是model的意思
           * @param item 這裏是node的意思，this.graph.getVertices()裏的項
           */
          update(cfg, item) {
            console.log("[update]->", "cfg", cfg, "item", item);

            const { level, status, name } = cfg;
            const group = item.getContainer();
            let mask = group.find((ele) => ele.get("name") === "mask-shape");
            let maskLabel = group.find(
              (ele) => ele.get("name") === "mask-label-shape"
            );
            if (level === 0) {
              group.get("children").forEach((child) => {
                if (child.get("name")?.includes("collapse")) return;
                child.hide();
              });
              // 如果不存在蒙版組件的情況
              if (!mask) {
                // 添加上蒙版（縮略的時候展示）
                mask = group.addShape("rect", {
                  attrs: {
                    x: -101,
                    y: -30 + 15,
                    width: 202,
                    height: 30, // 60,
                    opacity: 0,
                    fill: colors[status],
                    radius: 8,
                  },
                  name: "mask-shape",
                });
                // 蒙版上的名字（縮略的時候展示）
                maskLabel = group.addShape("text", {
                  attrs: {
                    fill: "#fff",
                    fontSize: 20,
                    x: 0,
                    y: 10,
                    text: name.length > 13 ? name.substr(0, 13) + "..." : name,
                    textAlign: "center",
                    opacity: 0,
                  },
                  name: "mask-label-shape",
                });
                const collapseRect = group.find(
                  (ele) => ele.get("name") === "collapse-back"
                );
                const collapseText = group.find(
                  (ele) => ele.get("name") === "collapse-text"
                );
                collapseRect?.toFront();
                collapseText?.toFront();
              } else {
                mask.show();
                maskLabel.show();
              }
              mask.animate({ opacity: 1 }, 150);
              maskLabel.animate({ opacity: 1 }, 150);
              return mask;
            } else {
              group.get("children").forEach((child) => {
                if (child.get("name")?.includes("collapse")) return;
                child.show();
              });
              mask?.animate(
                { opacity: 0 },
                {
                  duration: 150,
                  callback: () => mask.hide(),
                }
              );
              maskLabel?.animate(
                { opacity: 0 },
                {
                  duration: 150,
                  callback: () => maskLabel.hide(),
                }
              );
            }

            // let nameLabel = group.find((ele) => ele.get("name") === "name-element");
            // console.log("[nameLabel]->", nameLabel);
            // nameLabel.attrs.text = name;

            this.updateLinkPoints(cfg, group);
          },
          setState(name, value, item) {
            if (name === "collapse") {
              const group = item.getContainer();
              const collapseText = group.find(
                (e) => e.get("name") === "collapse-text"
              );
              if (collapseText) {
                if (!value) {
                  collapseText.attr({
                    text: "-",
                  });
                } else {
                  collapseText.attr({
                    text: "+",
                  });
                }
              }
            }
          },
          getAnchorPoints() {
            return [
              [0, 0.5],
              [1, 0.5],
            ];
          },
        },
        "rect"
      );

      G6.registerEdge(
        "flow-cubic",
        {
          getControlPoints(cfg) {
            let controlPoints = cfg.controlPoints; // 指定controlPoints
            if (!controlPoints || !controlPoints.length) {
              const { startPoint, endPoint, sourceNode, targetNode } = cfg;
              const {
                x: startX,
                y: startY,
                coefficientX,
                coefficientY,
              } = sourceNode ? sourceNode.getModel() : startPoint;
              const { x: endX, y: endY } = targetNode
                ? targetNode.getModel()
                : endPoint;
              let curveStart = (endX - startX) * coefficientX;
              let curveEnd = (endY - startY) * coefficientY;
              curveStart = curveStart > 40 ? 40 : curveStart;
              curveEnd = curveEnd < -30 ? curveEnd : -30;
              controlPoints = [
                { x: startPoint.x + curveStart, y: startPoint.y },
                { x: endPoint.x + curveEnd, y: endPoint.y },
              ];
            }
            return controlPoints;
          },
          getPath(points) {
            const path = [];
            path.push(["M", points[0].x, points[0].y]);
            path.push([
              "C",
              points[1].x,
              points[1].y,
              points[2].x,
              points[2].y,
              points[3].x,
              points[3].y,
            ]);
            return path;
          },
        },
        "single-line"
      );
    },
    /**
     * 初始化
     * @param data 圖的要渲染的數據
     */
    initGraph(data) {
      if (!data) {
        return;
      }
      const { onInit, config } = this.props;
      const tooltip = new G6.Tooltip({
        // offsetX and offsetY include the padding of the parent container
        offsetX: 20,
        offsetY: 30,
        // the types of items that allow the tooltip show up
        // 允许出现 tooltip 的 item 类型
        itemTypes: ["node"],
        // custom the tooltip's content
        // 自定义 tooltip 内容
        getContent: (e) => {
          const outDiv = document.createElement("div");
          //outDiv.style.padding = '0px 0px 20px 0px';
          const nodeName = e.item.getModel().name;
          let formatedNodeName = "";
          for (let i = 0; i < nodeName.length; i++) {
            formatedNodeName = `${formatedNodeName}${nodeName[i]}`;
            if (i !== 0 && i % 20 === 0)
              formatedNodeName = `${formatedNodeName}<br/>`;
          }
          outDiv.innerHTML = `${formatedNodeName}`;
          return outDiv;
        },
        shouldBegin: (e) => {
          if (
            e.target.get("name") === "name-element" ||
            e.target.get("name") === "mask-label-shape"
          )
            return true;
          return false;
        },
      });
      this.graph = new G6.TreeGraph({
        container: "treeGraphContainer",
        ...this.defaultConfig,
        ...config,
        plugins: [tooltip],
      });
      window.graph = this.graph;
      if (typeof onInit === "function") {
        onInit(this.graph);
      }
      this.graph.data(data);
      this.graph.render();

      /**
       * 執行展開或收縮的操作
       */
      const handleCollapse = (e) => {
        const target = e.target;
        const id = target.get("modelId");
        const item = this.graph.findById(id);
        const nodeModel = item.getModel();
        nodeModel.collapsed = !nodeModel.collapsed;
        this.graph.layout();
        this.graph.setItemState(item, "collapse", nodeModel.collapsed);
      };
      // 加號或減號被點擊時
      this.graph.on("collapse-text:click", (e) => {
        handleCollapse(e);
      });
      // 加減號外面的小方塊被點擊時
      this.graph.on("collapse-back:click", (e) => {
        handleCollapse(e);
      });
      // 設置icon被點擊時
      this.graph.on("setting-element:click", (e) => {
        // 朝對話框賦值
        this.operateDialogData.dialogTitle = "编辑";
        this.operateDialogVisible = true;
        const { model } = e.item._cfg;
        this.operateDialogData.id = model.id;
        this.operateDialogData.decisionType = model.decisionType;
        switch (e.item._cfg.model.decisionType) {
          case "parameter":
            this.operateDialogData.parameter = {
              valueType: model.decisionData.parameter.valueType,
              value: model.decisionData.parameter.value,
            };
            break;
          case "compare":
            this.operateDialogData.compare = {
              method: model.decisionData.compare.method,
              valueType: model.decisionData.compare.valueType,
              value: model.decisionData.compare.value,
            };
            break;
          case "action":
            this.operateDialogData.action = {
              value: model.decisionData.action.value,
        };
            break;
        }
      });
      // 添加的icon被點擊時
      this.graph.on("add-element:click", (e) => {
        // 朝對話框賦值
        this.operateDialogData.dialogTitle = "新增";
        const { model } = e.item._cfg;
        this.operateDialogData.id = model.id;
        this.operateDialogVisible = true;
      });
      // 刪除的icon被點擊時
      this.graph.on("delete-element:click", (e) => {
        const { model } = e.item._cfg;
        console.log("[model]->", model);
        const item = this.graph.findById(model.id);
        this.graph.removeChild(model.id);
        this.graph.getNodes().forEach((m) => {
          m.draw();
        });

        // setTimeout(() => {
        //   const node = this.graph.findById(model.id);
        //   if(node) {
        //     this.graph.removeItem(node);
        //     this.graph.refresh();
        //   }
        // }, 1000);
      });

      // 监听画布缩放，缩小到一定程度，节点显示缩略样式
      let currentLevel = 1;
      // const briefZoomThreshold = Math.max(this.graph.getZoom(), 4);
      const briefZoomThreshold = 0.7;
      this.graph.on("viewportchange", (e) => {
        if (e.action !== "zoom") return;
        const currentZoom = this.graph.getZoom();
        let toLevel = currentLevel;
        if (currentZoom < briefZoomThreshold) {
          toLevel = 0;
        } else {
          toLevel = 1;
        }
        if (toLevel !== currentLevel) {
          currentLevel = toLevel;
          this.graph.getNodes().forEach((node) => {
            this.graph.updateItem(node, {
              level: toLevel,
            });
          });
        }
      });
      // this.graph.on("node:click", (e) => {
      //   console.log("[node:click e]->", e);
      //   // const id = e.item._cfg.id;
      //   // // const node = this.graph.findById(id);
      //   // // console.log("[node]->", node);

      //   this.graph.updateItem(e.item, {
      //     name: "a",
      //   });
      //   // e.item.update(model, null);
      //   e.item.draw();
      // });
    },
    /**
     * 圖移動到中央
     */
    graphFitCenter() {
      // 這是由於取消了fitCenter后初始節點的位置變爲(0, 0)（左上角）
      this.graph.translate(140, 80); // 暫時先移動一點點就好...以後在做調整優化
    },
    /**
     * 對話框點擊保存
     */
    saveDetail() {
      const _decisionType = this.operateDialogData.decisionType; // parameter, compare, action
      const _decisionData = {
        parameter: this.operateDialogData.parameter, // { value, valueType }
        compare: this.operateDialogData.compare,
        action: this.operateDialogData.action,
      };

      const currentId = this.operateDialogData.id;

      if (this.operateDialogData.dialogTitle === "新增") {
        const fatherNode = this.graph.findById(currentId);
        const newId = uuid();
        const newNode = {
          id: newId,
          name: "new",
          children: [],
          decisionType: _decisionType,
          decisionData: _decisionData,
        };

        this.graph.addChild(newNode, fatherNode);
      } else if (this.operateDialogData.dialogTitle === "编辑") {
      const nodes = this.graph.getNodes();
        const node = nodes.find((n) => n._cfg.id === currentId);
      if (node) {
        this.graph.updateItem(node, {
            decisionType: _decisionType,
            decisionData: _decisionData,
        });
      node.draw();
        }
      }

      this.operateDialogVisible = false;

      // this.graph.updateItem(item, {
      //   name: "a",
      //   rate: 0.5,
      // });
      // // item.update(model, null);
      // item.draw();
    },
  },
};
</script>

<style scoped lang="scss">
.component-container {
  padding: 10px 0px 0px 10px;
  .decision-tree {
    width: 90vw;
    height: 800px;
    border: 1px solid rgb(0, 145, 255);
    border-radius: 6px;
  }
  .detail-dialog {
    .detail-dialog-content {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
