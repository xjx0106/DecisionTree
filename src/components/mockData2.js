const mockData = {
  id: "g1",
  name: "Name1",
  decisionType: "parameter", // 變量
  decisionData: {
    parameter: {
      value: "姓名",
      valueType: "variable",
    }
  },
  children: [
    {
      id: "g12",
      decisionType: "compare", // 條件
      decisionData: {
        compare: {
          method: "bigger", // 大於
          value: "3",
          valueType: "input", // 變量、常量、輸入值
        }
      },
      name: "Deal with LONG label LONG label LONG label LONG label",
      children: [
        {
          id: "g121",
          name: "Name3",
          collapsed: true,
          decisionType: "parameter", // 變量
          decisionData: {
            parameter: {
              value: "姓名",
              valueType: "variable",
            }
          },
          children: [
            {
              id: "g1211",
              name: "Name4",
              decisionType: "parameter", // 變量
              decisionData: {
                parameter: { 
                  value: "姓名",
                  valueType: "variable",
                }
              },
              children: [],
            },
          ],
        },
        {
          id: "g122",
          name: "Name5",
          collapsed: true,
          decisionType: "parameter", // 變量
          decisionData: {
            parameter: {
              value: "姓名",
              valueType: "variable",
            }
          },
          children: [
            {
              id: "g1221",
              name: "Name6",
              decisionType: "parameter", // 變量
              decisionData: {
                parameter: {
                  value: "姓名",
                  valueType: "variable",
                }
              },
              children: [
                {
                  id: "g12211",
                  name: "Name6-1",
                  decisionType: "parameter", // 變量
                  decisionData: {
                    parameter: {
                      value: "姓名",
                      valueType: "variable",
                    }
                  },
                  children: [],
                },
              ],
            },
            {
              id: "g1222",
              name: "Name7",
              decisionType: "parameter", // 變量
              decisionData: {
                parameter: {
                  value: "姓名",
                  valueType: "variable",
                },
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

export default mockData;
