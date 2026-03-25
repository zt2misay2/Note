# 第三周作业

问答题为主

> 关系代数的基本运算有哪些?

  - 并 ∪
  - 差 -
  - 笛卡尔积 ×
  - 选择 σ 选择选行
  - 投影 π 投影选列

选择是选中一个对象 投影是转化出一个新的表

> 与高级语言c相比，关系代数语言的非过程化程度如何?

过程化与非过程化

1. 过程化：强调“怎么做”。你要一步步告诉系统先做什么、后做什么
2. 非过程化：强调“要什么”。你描述目标结果，至于具体怎么执行，更多交给系统决定

C语言更加过程化 程序的执行流 内存分配 变量定义都得自己解决

关系代数语言非过程化程度更高 但是仍然需要遵循运算顺序规则 不是完全的非过程化



> 对于查询请求:选修了“95002”选修的全部课程的学生学号，关系代数表达式
> SC ÷ ((SC where S# = ‘95002’)[C#])
> 能得到正确结果吗?为什么?

不能 C#指代的是课头号 而 ((SC where S#='95002')[C#]) 表示被 95002选过的课头号集合 如果SC这个表不止包含学号和课头号 就会除剩多余的信息



> 等值连接与自然连接的区别是?

**自然连接是等值连接的特殊情况** 

自然连接会自动合并等值的属性 而等值连接会保留 

自然连接会隐式使用等值属性 而等值连接必须显式声明 



> 关系代数的基本运算有哪些?如何用这些基本运算表示其它的关系运算?

1 中阐明了有哪些基本运算种类

交运算可以表示 A交B=A差A并B

连接可以被笛卡尔积表示

自然连接和连接没有本质差别 

除可以表示为 先投影 再笛卡尔积 再做差

![image-20260318175055382](HW3/image-20260318175055382.png)

![image-20260318175114374](HW3/image-20260318175114374.png)

用关系代数 不管优化乱写的）

1. 读SPJ表，按照 `JNO = J1` 读取 `SNO` $\prod_{\text{SNO}}\sigma_{\text{SPJ.JNO=J1}}(\text{SPJ})$

2. 读SPJ表，按照 `JNO = J1` 且 `PNO = P1` 读取 `SNO`$\prod_{\text{SNO}}\sigma_{\text{SPJ.JNO=J1}\land\text{SPJ.PNO=P1}}(\text{SPJ})$

3. 涉及颜色时要读 `P` 表，但需要先把 `PNO` 和 `JNO` 联系起来。先连接 `P` 和 `SPJ`，再根据 `COLOR = RED` 读取 `SNO`：$\prod_{\text{SNO}}\sigma_{\text{COLOR=RED}}(\text{P}\bowtie\text{SPJ})$

4. 没有使用 考虑求差 涉及供应商 和颜色 要读 JNO 先考虑J表 还要和颜色联上 考虑 S -> SPJ -> P 需要满足以下约束

    不用天津供应商：$\text{S.CITY} \ne \text{TJ}$；红色零件：$\text{P.COLOR} = \text{RED}$。

    先查出所有红色零件的工程号：

    $$
    \prod_{\text{JNO}}\sigma_{\text{COLOR=RED}}(\text{P}\bowtie\text{SPJ})
    $$

    再求出所有天津供应商、红色零件对应的工程号：

    $$
    S_A=\prod_{\text{SNO}}\sigma_{\text{S.CITY=TJ}}(\text{S})
    $$

    $$
    P_A=\prod_{\text{PNO}}\sigma_{\text{P.COLOR=RED}}(\text{P})
    $$

    $$
    J_A=\prod_{\text{JNO}}\sigma_{\text{SPJ.SNO=}S_A\land\text{SPJ.PNO=}P_A}(\text{SPJ})
    $$

    最后：

    $$
    J_0=\prod_{\text{JNO}}\sigma_{\text{COLOR=RED}}(\text{P}\bowtie\text{SPJ})-J_A
    $$

5. 先读 `SPJ` 表，把供应商号 `S` 和零件号 `P` 联系起来：$P_0=\prod_{\text{PNO}}\sigma_{\text{SPJ.SNO=S1}}(\text{SPJ})$

   分析要求，也就是使用的零件 `P` 包含 `P1`、`P2` 的 `JNO`，可以考虑除法。

   单独取 `PNO` 一列构成 `P_0`，可以直接：$\text{SPJ}_0=\text{SPJ}\div P_0$

   再读取：$\prod_{\text{JNO}}(\text{SPJ}_0)$
