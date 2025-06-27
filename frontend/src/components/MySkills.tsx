import TechGrid from "./TechGrid";

const MySkills: React.FC = () => {
  return (
    <div className="skills-container">
      <h2>我会什么</h2>
      <TechGrid />
      {/* 除了编程语言以外还做过什么玩过什么 */}
      {/* 树莓派 使用Python控制小车 */}
      {/* 会搭深度学习框架 */}
      {/* 懂日语 并且还挺喜欢的 */}

    </div>
  )
}

export default MySkills;