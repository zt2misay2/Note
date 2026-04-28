# 进程同步三

---

- SP SV操作

进程可以申请复数个信号 同时可能开销掉资源 

**$S$ (Semaphore)**：代表某种资源的数量（池子里还有多少）。

**$t$ (Threshold)**：代表**下限门槛**。意思是：“池子里至少得有 $t$ 个，我才愿意进去，少一个都不行”。

**$d$ (Demand)**：代表**实际消耗量**。意思是：“我进去之后，要从池子里拿走 

以此做好铺垫 方能防止关于进程资源的互斥和死锁

SV则是直接把$d$给补回去

- 管程

通过互斥的方式 让每个进程独自处理资源 并且执行

可以分为 执行、等待、唤醒 三部分

**执行（Enter）**：进程申请进入管程，如果管程空闲，它就进去执行内部的函数。

**等待（Wait）**：进程在执行过程中，如果发现需要的资源不够（例如缓冲区空了），它执行 `x.wait`。此时它会做两件事：

- 把自己挂起，加入到条件变量 `x` 的等待队列中 
- **立刻释放管程的互斥锁**，让大门外（入口队列）或者紧急队列里的其他进程进来 。  

**唤醒（Signal）**：另一个进程进入管程，放入了资源（例如往缓冲区写了数据），它执行 `x.signal`。这会：

- 把条件变量 `x` 队列头部的第一个等待进程唤醒 

- （在 Hoare 方法中）执行唤醒操作的进程自己排入紧急等待队列，把运行权立刻交给被唤醒的进程 。  

> 使用管程解决实际问题

管程是不同进程之间对于互斥资源变量的读写安排

- 先定义封装共享变量
    把引发冲突的资源（比如缓冲区数组、计数器、状态标志）全部锁进管程内部，不允许外部直接读写
- 定义条件变量
    就上方封装的变量 设定 进程的执行需要满足哪些变量 即 `notfull` 和 `notempty`
- 编写互斥操作
    当数据条件互斥的时候 按照规定进行PV操作 互斥
- `Wait` `Signal` 





## Q1

> 写出无死锁的哲学家进餐问题的信号量解法

即使用PV信号

对特定的人物 $i$ 他能够吃饭的条件是左右两侧不在吃饭 

```C
semaphore chopstick[5] = {1, 1, 1, 1, 1}; 

void philosopher(int i) {
    while(true) {
        think(); // 思考
        // 申请左右两侧的筷子
        SP(chopstick[i], chopstick[(i+1)%5]); 
        eat();   // 进餐
        // 释放筷子
        SV(chopstick[i], chopstick[(i+1)%5]); 
    }
}
```



## Q2

> 有P1、P2、P3三类进程（每类进程都有K个）共享一组表格F（F有N个）
>
> P1对F只读不写，P2对F只写不读，P3对F先读后写
>
> 进程可同时读同一个 $Fi\;\;0≤i ≤ N$；但有进程写时，其他进程不能读和写。
>
> - 用信号量和P、V操作给出方案
>
> - 对方案的正确性进行分析说明
>
> - 对访问的公平性进行分析

对P123 用 `w` 表示正在写 用`r3`表示P3正在读 `mutex`即为常见互斥锁 

```C
void P1_Reader() {
    P(rmutex);
    if (read_count == 0) {
        P(w); //此时只读 其余进程不能写
    }
    read_count++;
    V(rmutex);
	
    read(Fi);
    
    P(rmutex);
    read_count--;
    if (read_count == 0) {
        V(w); // 此时读完没有其余进程 允许写
    }
    V(rmutex);
}
```

P2只要能写就直接写

```C
void P2_Writer() {
	P(w);
    write(Fi);
    V(w);
}
```

P3需要先抢到单独读 再转为写 **也就是保证同一时间只有一个P3在读写F表**

```C
void P3_readThenwrite() {
    P(r3);
    P(rmutex);
    if (read_count == 0) {
        P(w); // P2不能写
    }
    read_count++;
    V(rmutex);
    
    P3Read(Fi);
    
    P(rmutex);
    read_count--;
    if (read_conut == 0) {
		V(w);
    }
    V(rmutex);
    
    //抢写
    P(w);
    
    P3Write(Fi);
    
    V(w);
    
    //P3流程结束
    V(r3);
    
}
```

P3P1 共享互斥锁`rmutex` 但是P2只看锁 `w` P2可能存在饥饿 



## Q3

> 独木桥只允许一台汽车过河，当车到达桥头时，如果桥上无车，则可上桥，否则车在桥头等待，直到桥上无车。使用PV操作解决该问题

简单互斥锁 用 `on`表示桥上是否有车

```C
void car() {
    P(on);
    pass(car);
    V(on);
}
```

> 如果独木桥允许多台车同方向过河，当车到达桥头时，如果桥上只有同方向车且不超过N台，或者桥上无车，则可上桥通过，否则等待，直到满足上桥条件。使用PV操作解决该问题

当桥完全空旷 两侧都没车时 可以任意一个方向过桥 为了方便讨论 定义桥锁 `bridge` 表示从A方向有车在等待 此时从B方向的车无法上桥  方向锁 `mutex-A`  维护计数器

用`capacity` 表述桥此时的容量

```C
void multiCar() {
    // 等方向锁 车上桥开始等
    P(mutex-A);
    if (count == 0) {
        // 桥上第一辆 开始锁桥
        P(bridge);
    }
    count++;
    V(mutex-A);
    //等待桥产生空闲
    P(capacity);
    
    pass(car);
    V(capacity);
    
    P(mutex-A);
    count--;
    if (count == 0) {
        //桥上最后一辆跑完 给桥解锁
        V(bridge);
    }
	V(mutex-A);
    
}
```

## Q4

> 有红客和黑客两组人员需要过河。河上有船，但是每次只能乘坐4人，且每次乘客满员时才能开船，到河对岸后空船返回。但船上乘客不能同时有3个红客 、1个黑客 或者 1个红客 、 3个黑客的组合。（其他组合安全）。请用PV操作解决红客、黑客过河的问题

只看可行信号 也就是等待 2红2黑 4红 4黑的情况

关键在于不能先上船再看信号 必须岸上凑齐四个人再上船 那么维持两个队列 

对于某一个阵营 只要当前双队列满足要求 就可以直接产生一个 `isCaptain` 让人上船

```c
void pass_river_red() {
    // 标记自己能否带红队上船
    bool isCaptain = false;
    P(mutex);
    red_wait++;
    
    if (wait_R >= 4) {
        wait_R -= 4;
        V(queue_R);
        V(queue_R);
        V(queue_R);
        isCaptain = true;
    } else if (wait_R >= 2 && wait_B >= 2) {
        wait_R -= 2;
        wait_B -= 2;
        V(queue_R);
        V(queue_B);
        V(queue_B);
        isCaptain = true;
    }
    
    if (!isCaptain) {
        V(mutex);
        P(queue_R);
    }
    board_boat();
    if (isCaptain) {
        row_boat();
        V(mutex);
    }
}
```

