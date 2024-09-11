// Interface for splitting strategy
interface ISplitStrategy {
    split(amount: number, users: User[], shares?: number[]): Map<User, number>;
  }
  
  // User entity
  class User {
    constructor(
      public userId: string,
      public name: string,
      public email: string,
      public mobileNumber: string
    ) {}
  }
  
  // Balance entity
  class Balance {
    private balances: Map<User, Map<User, number>> = new Map();
  
    addBalance(from: User, to: User, amount: number) {
      if (!this.balances.has(from)) {
        this.balances.set(from, new Map());
      }
      const userBalances = this.balances.get(from)!;
      userBalances.set(to, (userBalances.get(to) || 0) + amount);
    }
  
    getBalances(): Map<User, Map<User, number>> {
      return this.balances;
    }
  
    getBalanceForUser(user: User): Map<User, number> | undefined {
      return this.balances.get(user);
    }
  
    showBalances() {
      let isEmpty = true;
      this.balances.forEach((oweMap, user) => {
        oweMap.forEach((amount, oweUser) => {
          if (amount !== 0) {
            isEmpty = false;
            console.log(`${oweUser.userId} owes ${user.userId}: ${amount.toFixed(2)}`);
          }
        });
      });
      if (isEmpty) {
        console.log("No balances");
      }
    }
  
    showBalanceForUser(user: User) {
      const balances = this.getBalanceForUser(user);
      if (!balances) {
        console.log("No balances");
        return;
      }
  
      let isEmpty = true;
      balances.forEach((amount, oweUser) => {
        if (amount !== 0) {
          isEmpty = false;
          if (amount > 0) {
            console.log(`${oweUser.userId} owes ${user.userId}: ${amount.toFixed(2)}`);
          } else {
            console.log(`${user.userId} owes ${oweUser.userId}: ${(-amount).toFixed(2)}`);
          }
        }
      });
  
      if (isEmpty) {
        console.log("No balances");
      }
    }
  }
  
  // Equal splitting strategy
  class EqualSplitStrategy implements ISplitStrategy {
    split(amount: number, users: User[]): Map<User, number> {
      const splitAmount = parseFloat((amount / users.length).toFixed(2));
      const remainder = parseFloat((amount - splitAmount * users.length).toFixed(2));
  
      const splits = new Map<User, number>();
      users.forEach((user, index) => {
        splits.set(user, index === 0 ? splitAmount + remainder : splitAmount);
      });
  
      return splits;
    }
  }
  
  // Exact splitting strategy
  class ExactSplitStrategy implements ISplitStrategy {
    split(amount: number, users: User[], shares: number[]): Map<User, number> {
      const splits = new Map<User, number>();
      const total = shares.reduce((sum, share) => sum + share, 0);
  
      if (total !== amount) {
        throw new Error("Exact shares do not sum up to the total amount");
      }
  
      users.forEach((user, index) => {
        splits.set(user, shares[index]);
      });
  
      return splits;
    }
  }
  
  // Percent splitting strategy
  class PercentSplitStrategy implements ISplitStrategy {
    split(amount: number, users: User[], shares: number[]): Map<User, number> {
      const totalPercent = shares.reduce((sum, share) => sum + share, 0);
  
      if (totalPercent !== 100) {
        throw new Error("Percent shares do not sum up to 100%");
      }
  
      const splits = new Map<User, number>();
      users.forEach((user, index) => {
        const splitAmount = parseFloat(((shares[index] / 100) * amount).toFixed(2));
        splits.set(user, splitAmount);
      });
  
      return splits;
    }
  }
  
  // Expense entity
  class Expense {
    constructor(
      public paidBy: User,
      public amount: number,
      public users: User[],
      private splitStrategy: ISplitStrategy,
      public shares?: number[]
    ) {}
  
    execute(balance: Balance) {
      const splits = this.splitStrategy.split(this.amount, this.users, this.shares);
      splits.forEach((splitAmount, user) => {
        if (user !== this.paidBy) {
          balance.addBalance(this.paidBy, user, splitAmount);
        }
      });
    }
  }
  
  // UserManager (Singleton)
  class UserManager {
    private users: Map<string, User> = new Map();
    private static instance: UserManager;
  
    private constructor() {}
  
    static getInstance(): UserManager {
      if (!UserManager.instance) {
        UserManager.instance = new UserManager();
      }
      return UserManager.instance;
    }
  
    addUser(user: User) {
      this.users.set(user.userId, user);
    }
  
    getUser(userId: string): User | undefined {
      return this.users.get(userId);
    }
  }
  
  // Main function
  const main = () => {
    const userManager = UserManager.getInstance();
    const balance = new Balance();
  
    const user1 = new User("u1", "User1", "user1@example.com", "1234567890");
    const user2 = new User("u2", "User2", "user2@example.com", "1234567891");
    const user3 = new User("u3", "User3", "user3@example.com", "1234567892");
    const user4 = new User("u4", "User4", "user4@example.com", "1234567893");
  
    userManager.addUser(user1);
    userManager.addUser(user2);
    userManager.addUser(user3);
    userManager.addUser(user4);
  
    // Sample input processing
    const expense1 = new Expense(user1, 1000, [user1, user2, user3, user4], new EqualSplitStrategy());
    expense1.execute(balance);
  
    const expense2 = new Expense(user1, 1250, [user2, user3], new ExactSplitStrategy(), [370, 880]);
    expense2.execute(balance);
  
    const expense3 = new Expense(user4, 1200, [user1, user2, user3, user4], new PercentSplitStrategy(), [40, 20, 20, 20]);
    expense3.execute(balance);
  
    // Show balances
    console.log("All balances:");
    balance.showBalances();
  
    console.log("\nBalances for user u1:");
    balance.showBalanceForUser(user1);
  };
  
  // Execute main function
  main();

  /*
    
  
  */
  