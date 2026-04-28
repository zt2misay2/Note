> 什么是数据库的安全性?什么是数据库的完整性?二者之间有哪些联系和区别?

数据库安全性是指保护数据库，以防止不合法的使用所造成的数据泄露、更改或破坏 

数据库的完整性指的是数据的正确性和相容性

- 区别: 二者防范的侧重点不同 **安全性** 侧重于防范“人”的恶意行为；而 **完整性** 侧重于防范“数据”的逻辑错误

- 联系：两者都是为了保障数据库中数据的可用性、可靠性和正确性

> 数据库安全控制的常用方法有哪些?

- 用户标识与鉴别 

- DBMS 存取控制与授权

- 视图机制
- 角色
- 审计追踪
- 数据加密



/// details | Q3

![image-20260318175055382](HW8/image-20260318175055382.png)

![image-20260318175114374](HW8/image-20260318175114374.png)



设有四个关系模式:

S(SNO, SNAME, CITY);

P(PNO, PNAME, COLOR, WEIGHT);

J(JNO, JNAME, CITY);

SPJ(SNO, PNO, JNO, QTY);

其中，

供应商表S有供应商号(SNO)、供应商姓名(SNAME)、供应商所在城市(CITY)组成，记录各个供应商的情况;

零件表P由零件号(PNO)、零件名称(PNAME)、零件颜色(COLOR)、零件重量(WEIGHT)组成，记录各种零件的情况;

工程项目表J由项目号(JNO)、项目名(JNAME)、项目所在城市(CITY)组成，记录各个工程项目的情况;

供应情况表SPJ由供应商号(SNO)、零件号(PNO)、项目号(JNO)、供应数量(QTY)组成，记录各供应商供应各种零件给各工程项目的数量。

(这四张表的实例见教材P63-64页)

请用SQL完成下列操作。

假设有用户张成、徐天、刘澜。

(1)将S, P, J 和 SPJ 表的所有权限授予用户张成。

(2)将SPJ表的SELECT权和QTY列的UPDATE权授予用户徐天，并允许他转授这些权限。

(3)回收刘澜用户对S表SNO列的修改权。

(4)将S表中北京供应商的SELECT权授予徐天。	

///



> 将S, P, J 和 SPJ 表的所有权限授予用户张成

发权限 用GRANT 

```SQL
GRANT ALL PRIVILEGES ON TABLE S TO 张成;
GRANT ALL PRIVILEGES ON TABLE P TO 张成;
GRANT ALL PRIVILEGES ON TABLE J TO 张成;
GRANT ALL PRIVILEGES ON TABLE SPJ TO 张成;
```



> 将SPJ表的SELECT权和QTY列的UPDATE权授予用户徐天，并允许他转授这些权限

发权限  `WITH GRANT OPTION`表示允许转发

```SQL
GRANT SELECT, UPDATE(QTY) ON TABLE SPJ TO 徐天 WITH GRANT OPTION
```



> 回收刘澜用户对S表SNO列的修改权

REVOKE

```SQL
REVOKE UPDATE(SNO) ON TABLE S FROM 刘澜
```



> 将S表中北京供应商的SELECT权授予徐天

先创建视图 再给SELECT权

```SQL
CREATE VIEW SUPPLY AS 
SELECT * FROM S WHERE CITY = "北京";

GRANT SELECT ON SUPPLY TO 徐天
```

