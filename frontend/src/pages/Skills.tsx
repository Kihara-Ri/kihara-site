import MyLearn from "../components/MyLearn";
import MySkills from "../components/MySkills";
import layout from '../components/layout/PageLayout.module.css';

const Skills: React.FC = () => {
  return (
    <div className={[layout.page, layout.main, layout.mainStretch].join(' ')}>
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
