const mockData = {
  id: "g1",
  name: "参数",
  decisionType: "parameter", // 變量
  decisionData: {
    parameter: {
      value: "银行",
      valueType: "variable",
    },
  },
  children: [
    {
      id: "g12",
      name: "对比",
      decisionType: "compare", // 條件
      decisionData: {
        compare: {
          method: "equal", // 大於
          value: "中国银行",
          valueType: "input", // 變量、常量、輸入值
        },
      },
      children: [
        {
          id: "g121",
          name: "参数",
          collapsed: true,
          decisionType: "parameter", // 變量
          decisionData: {
            parameter: {
              value: "月收入",
              valueType: "variable",
            },
          },
          children: [
            {
              id: "g1211",
              name: "对比",
              decisionType: "compare",
              decisionData: {
                compare: {
                  method: "smaller",
                  value: "4000",
                  valueType: "input",
                },
              },
              children: [
                {
                  id: "g12111",
                  name: "动作",
                  decisionType: "action", // 动作
                  decisionData: {
                    action: {
                      value: "reject",
                    },
                  },
                  children: [],
                },
              ],
            },
            {
              id: "g1212",
              name: "对比",
              decisionType: "compare",
              decisionData: {
                compare: {
                  method: "smaller",
                  value: "8000",
                  valueType: "input",
                },
              },
              children: [
                {
                  id: "g12121",
                  name: "对比",
                  decisionType: "compare",
                  decisionData: {
                    compare: {
                      method: "bigger_equal",
                      value: "4000",
                      valueType: "input",
                    },
                  },
                  children: [
                    {
                      id: "g121211",
                      name: "动作",
                      decisionType: "action",
                      decisionData: {
                        action: {
                          value: "reject",
                        },
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
            {
              id: "g1213",
              name: "对比",
              decisionType: "compare",
              decisionData: {
                compare: {
                  method: "bigger_equal",
                  value: "8000",
                  valueType: "input",
                },
              },
              children: [
                {
                  id: "g12131",
                  name: "动作",
                  decisionType: "action", // 动作
                  decisionData: {
                    action: {
                      value: "pass",
                    },
                  },
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: "g122",
          name: "参数",
          collapsed: true,
          decisionType: "parameter", // 變量
          decisionData: {
            parameter: {
              value: "年龄",
              valueType: "variable",
            },
          },
          children: [
            {
              id: "g1221",
              name: "对比",
              decisionType: "compare", // 對比
              decisionData: {
                compare: {
                  method: "bigger_equal",
                  value: "法定成年",
                  valueType: "constant",
                },
              },
              children: [
                {
                  id: "g12211",
                  name: "动作",
                  decisionType: "action",
                  decisionData: {
                    action: {
                      value: "pass",
                    },
                  },
                },
              ],
            },
            {
              id: "g1222",
              name: "对比",
              decisionType: "compare", // 對比
              decisionData: {
                compare: {
                  method: "smaller",
                  value: "法定成年",
                  valueType: "constant",
                },
              },
              children: [
                {
                  id: "g12221",
                  name: "动作",
                  decisionType: "action",
                  decisionData: {
                    action: {
                      value: "reject",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "g11",
      name: "对比",
      decisionType: "compare", // 條件
      decisionData: {
        compare: {
          method: "not_equal",
          value: "中国银行",
          valueType: "input", // 變量、常量、輸入值
        },
      },
      children: [
        {
          id: "g111",
          name: "动作",
          decisionType: "action",
          decisionData: {
            action: {
              value: "reject",
            },
          },
        },
      ],
    },
  ],
};

export default mockData;
