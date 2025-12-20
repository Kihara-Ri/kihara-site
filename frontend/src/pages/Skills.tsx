import MyLearn from "../components/MyLearn";
import MySkills from "../components/MySkills";

const Skills: React.FC = () => {
  return (
    <div className="main-container">
      <MyLearn
        items={[
          { name: '信息论', score: 6/7*100 },
          { name: '数字电路', score: 8/9*100, color: '#30db50' },
          { name: '数据结构与算法', score: 10/10*100 },
        ]}
      />
      <MySkills />
    </div>
  )
};
export default Skills;
