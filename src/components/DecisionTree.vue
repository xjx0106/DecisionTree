<template>
  <div class="component-container">
    <div
      class="decision-tree"
      id="treeGraphContainer"
      ref="treeGraphContainer"
    ></div>
    <el-dialog
      title="详细信息"
      :visible.sync="detailDialogVisible"
      width="500"
      class="detail-dialog"
      :close-on-click-modal="false"
    >
      <div class="detail-dialog-content">
        id
        <el-input
          v-model="detailDialogData.id"
          placeholder="id"
          :disabled="true"
        ></el-input>
        name
        <el-input v-model="detailDialogData.name" placeholder="name"></el-input>
      </div>
      <div slot="footer">
        <el-button @click="detailDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveDetail">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import G6 from "@antv/g6";
import insertCss from "insert-css";

import mockData from "./mockData.js";

export default {
  name: "DecisionTree",
  data() {
    return {
      // 圖譜相關的數據
      graph: null,
      defaultConfig: {
        width: 1200,
        height: 900,
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
          indent: 250, // 左右兩個節點之間的距離（橫向的）
          getHeight: () => {
            return 0;
          }, // 上下兩個節點之間的距離（竪向的）
        },
      },
      props: {
        // data: mockData,
        config: {
          padding: [20, 50],
          defaultLevel: 3,
          defaultZoom: 0.8,
          modes: { default: ["zoom-canvas", "drag-canvas"] },
        },
      },
      // 對話框相關的數據
      detailDialogVisible: false,
      detailDialogData: {
        id: "",
        name: "",
      },
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
    detailDialogVisible: {
      handler(val) {
        if (!val) {
          ({ detailDialogData: this.detailDialogData } = this.$options.data());
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
    this.defaultConfig.height = 900;

    this.initGraph(mockData);

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
      /**
       * 自定義節點
       */
      G6.registerNode(
        "flow-rect",
        {
          shapeType: "flow-rect",
          draw(cfg, group) {
            const {
              name = "",
              variableName,
              variableValue,
              variableUp,
              label,
              collapsed,
              currency,
              status,
            } = cfg;

            /**
             * 基礎方塊配置
             */
            const rectConfig = {
              width: 202,
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
            const bigTitle = group.addShape("text", {
              attrs: {
                ...textConfig,
                x: 18 + nodeOrigin.x,
                y: 22 + nodeOrigin.y,
                text: name.length > 20 ? name.substr(0, 20) + "..." : name,
                fontSize: 12,
                opacity: 0.85,
                fill: "#000",
                cursor: "pointer",
              },
              name: "name-element",
            });

            // 設置齒輪按鈕
            group.addShape("image", {
              attrs: {
                ...textConfig,
                width: 16.6,
                height: 16.6,
                fontSize: 12,
                img: require("../assets/image/setting.svg"),
                x: -nodeOrigin.x - 16.6 - 12,
                y: nodeOrigin.y + 6.3,
                cursor: "pointer",
                opacity: 0.4,
              },
              name: "setting-element",
            });

            // 三角形
            group.addShape("marker", {
              attrs: {
                ...textConfig,
                x: nodeOrigin.x + 10,
                y: bigTitle.getBBox().y + 4,
                symbol: variableUp ? "triangle" : "triangle-down",
                r: 6,
                fill: colors[status],
              },
            });

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
        this.detailDialogVisible = true;
        // 朝對話框賦值
        this.detailDialogData = {
          id: e.item._cfg.model.id,
          name: e.item._cfg.model.name,
        };
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
      this.graph.translate(180, 80); // 暫時先移動一點點就好...以後在做調整優化
    },
    /**
     * 對話框點擊保存
     */
    saveDetail() {
      const nodes = this.graph.getNodes();
      const node = nodes.find((n) => n._cfg.id === this.detailDialogData.id);
      if (node) {
        this.graph.updateItem(node, {
          name: this.detailDialogData.name,
        });
      }
      this.detailDialogVisible = false;
      node.draw();
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
  .decision-tree {
    width: 90vw;
    height: 900px;
    border: 1px solid gray;
  }
  .detail-dialog {
    .detail-dialog-content {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
