import { initDB, run, getDB } from './db.js';

async function seed() {
  await initDB();
  const db = getDB();

  // Clear existing data
  db.run('DELETE FROM milestones');
  db.run('DELETE FROM risks');
  db.run('DELETE FROM standup_logs');
  db.run('DELETE FROM tasks');
  db.run('DELETE FROM user_stories');
  db.run('DELETE FROM sprints');
  db.run('DELETE FROM projects');

  // Create project
  run("INSERT INTO projects (id, name, start_date, end_date) VALUES (1, '研途启航 - 2026级研究生入学准备全流程敏捷管理项目', '2026-06-01', '2026-07-26')");

  // Create sprints
  const sprints = [
    [1, 1, 1, 'Sprint 1：入学筹备冲刺', '2026-06-01', '2026-06-14', '完成所有入学行政手续和生活准备，建立项目管理基础工具', 'planned'],
    [2, 1, 2, 'Sprint 2：学术启航冲刺', '2026-06-15', '2026-06-28', '完成导师首次沟通并初步确定研究方向，搭建科研工具链基础', 'planned'],
    [3, 1, 3, 'Sprint 3：深度积累冲刺', '2026-06-29', '2026-07-12', '完成核心文献深度阅读，掌握学术写作和数据处理工具', 'planned'],
    [4, 1, 4, 'Sprint 4：整装待发冲刺', '2026-07-13', '2026-07-26', '完成项目全面复盘，优化个人学术展示，产出标准化项目经历', 'planned'],
  ];
  sprints.forEach(s => run('INSERT INTO sprints (id, project_id, number, name, start_date, end_date, goal, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', s));

  // Create user stories
  const stories = [
    ['US-001', 1, '入学材料清单梳理', '一次性梳理出完整的入学所需材料清单', 'S', 3, 1, 'todo', '清单包含证件类、档案类、照片类、费用类、其他特殊要求'],
    ['US-002', 1, '证件材料准备', '提前准备好身份证、录取通知书、户口迁移证等核心证件', 'S', 5, 1, 'todo', '所有Must Have材料已备齐并拍照留底'],
    ['US-003', 1, '录取后续手续办理', '完成政审、档案邮寄、党团关系转接等后续手续', 'S', 5, 1, 'todo', '政审表已盖章、档案已邮寄、党团关系已转出'],
    ['US-004', 1, '导师首次沟通', '在入学前与导师进行首次正式沟通', 'S', 3, 2, 'todo', '产出沟通纪要，包含研究方向、推荐书目、入学准备建议'],
    ['US-005', 1, '研究方向初步确认', '与导师讨论后初步确定研究方向', 'S', 5, 2, 'todo', '产出1份研究方向初步规划文档，导师已确认'],
    ['US-006', 1, '住宿与生活准备', '提前了解学校住宿条件并做好生活准备', 'S', 3, 1, 'todo', '住宿确认完成，生活用品清单已备齐'],
    ['US-007', 1, '核心文献阅读（第1本）', '阅读导师推荐的第1本核心文献', 'A', 8, 2, 'todo', '产出1份读书笔记（≥2000字）'],
    ['US-008', 1, '核心文献阅读（第2本）', '阅读第2本核心文献', 'A', 8, 3, 'todo', '产出1份读书笔记（≥2000字），包含与第1本的对比分析'],
    ['US-009', 1, '核心文献阅读（第3本）', '阅读第3本核心文献', 'A', 8, 3, 'todo', '产出1份读书笔记（≥2000字），包含三本书的整体知识图谱'],
    ['US-010', 1, '学习文献管理工具', '学会使用Zotero或EndNote进行文献管理', 'A', 5, 2, 'todo', '成功导入10篇文献，建立分类文件夹，完成1次引用插入'],
    ['US-011', 1, '学习笔记工具', '学会使用Obsidian或Notion搭建个人知识库', 'A', 5, 2, 'todo', '建立至少3个分类模块，录入10+条笔记，设置好模板'],
    ['US-012', 1, '学术写作工具', '学会使用LaTeX或Word高级排版', 'A', 5, 3, 'todo', '产出1份格式规范的模板文档'],
    ['US-013', 1, '数据处理工具', '学会使用Python/SPSS进行基础数据处理', 'A', 5, 3, 'todo', '完成1个小型数据集的清洗、分析、可视化全流程'],
    ['US-014', 1, '学习文献检索方法', '掌握CNKI、Web of Science等数据库的高级检索技巧', 'A', 3, 2, 'todo', '建立1个包含20+篇相关文献的检索结果集'],
    ['US-015', 1, '学术社交网络搭建', '关注研究领域内的核心学者和团队', 'B', 3, 4, 'todo', '关注至少10位核心学者，订阅3个相关期刊'],
    ['US-016', 1, '跨专业课程了解', '了解培养方案中的课程设置', 'B', 3, 3, 'todo', '产出1份课程规划表'],
    ['US-017', 1, '同届同学社群融入', '加入同届研究生的交流群组', 'B', 2, 1, 'todo', '加入至少2个群组，认识至少5位同届同学'],
    ['US-018', 1, '个人简历与学术主页优化', '更新个人简历并考虑建立学术主页', 'B', 3, 4, 'todo', '简历已更新至最新状态'],
  ];
  stories.forEach(s => run('INSERT INTO user_stories (story_id, project_id, title, description, priority, story_points, sprint_id, status, acceptance_criteria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', s));

  // Create tasks for Sprint 1
  const tasks = [
    [null, 1, '查阅学校官网入学通知', 'todo', 1, '2026-06-02'],
    [null, 1, '分类整理材料清单', 'todo', 2, '2026-06-03'],
    [null, 1, '标注各项截止时间', 'todo', 3, '2026-06-03'],
    [null, 1, '身份证复印', 'todo', 4, '2026-06-04'],
    [null, 1, '录取通知书保管', 'todo', 5, '2026-06-04'],
    [null, 1, '户口迁移证办理', 'todo', 6, '2026-06-06'],
    [null, 1, '照片拍摄', 'todo', 7, '2026-06-05'],
    [null, 1, '政审表填写与盖章', 'todo', 8, '2026-06-08'],
    [null, 1, '档案邮寄确认', 'todo', 9, '2026-06-09'],
    [null, 1, '党团关系转接', 'todo', 10, '2026-06-09'],
    [null, 1, '查询宿舍分配', 'todo', 11, '2026-06-10'],
    [null, 1, '生活用品采购', 'todo', 12, '2026-06-12'],
    [null, 1, '加入新生群组', 'todo', 13, '2026-06-03'],
    [null, 1, '自我介绍', 'todo', 14, '2026-06-04'],
    [null, 2, '撰写自我介绍邮件', 'todo', 1, '2026-06-16'],
    [null, 2, '预约沟通时间', 'todo', 2, '2026-06-17'],
    [null, 2, '准备问题清单', 'todo', 3, '2026-06-17'],
    [null, 2, '执行导师沟通', 'todo', 4, '2026-06-18'],
    [null, 2, '产出沟通纪要', 'todo', 5, '2026-06-18'],
    [null, 2, '梳理2-3个候选方向', 'todo', 6, '2026-06-19'],
    [null, 2, '撰写方向规划文档', 'todo', 7, '2026-06-20'],
    [null, 2, '获取第1本书目', 'todo', 8, '2026-06-16'],
    [null, 2, '制定阅读计划', 'todo', 9, '2026-06-16'],
    [null, 2, '逐章阅读与笔记', 'todo', 10, '2026-06-22'],
    [null, 2, '撰写读书报告', 'todo', 11, '2026-06-23'],
    [null, 2, '安装Zotero', 'todo', 12, '2026-06-17'],
    [null, 2, '学习Zotero基础操作', 'todo', 13, '2026-06-18'],
    [null, 2, '导入文献并分类', 'todo', 14, '2026-06-20'],
    [null, 2, '选定Obsidian/Notion', 'todo', 15, '2026-06-17'],
    [null, 2, '搭建目录结构', 'todo', 16, '2026-06-18'],
    [null, 2, '创建模板并录入笔记', 'todo', 17, '2026-06-20'],
    [null, 2, '学习CNKI高级检索', 'todo', 18, '2026-06-19'],
    [null, 2, '学习WoS检索', 'todo', 19, '2026-06-20'],
    [null, 2, '建立检索结果集', 'todo', 20, '2026-06-21'],
  ];
  tasks.forEach(t => run('INSERT INTO tasks (story_id, sprint_id, title, status, sort_order, due_date) VALUES (?, ?, ?, ?, ?, ?)', t));

  // Create risks
  const risks = [
    [1, '导师沟通时间不确定', '导师可能因出差、休假等原因无法在预期时间内完成首次沟通', 4, 4, 'high', '提前2周发送沟通邀请，同时准备2-3个时间选项', 'monitoring'],
    [1, '文献阅读进度滞后', '文献难度超出预期或因其他任务占用时间', 4, 3, 'medium', '采用略读→精读两遍阅读法', 'monitoring'],
    [1, '工具学习遇到技术障碍', 'Zotero、Obsidian等工具安装或使用过程中遇到兼容性问题', 3, 3, 'medium', '收藏官方文档和B站教程，准备替代工具方案', 'monitoring'],
    [1, '多任务切换导致效率下降', '同时推进多条线任务，频繁切换导致效率下降', 3, 3, 'medium', '按主题分批处理，单次专注时间≥90分钟', 'monitoring'],
    [1, '生活突发事件打乱计划', '家庭事务、身体健康等突发事件占用计划外时间', 3, 2, 'low', '每Sprint预留1天缓冲时间', 'monitoring'],
  ];
  risks.forEach(r => run('INSERT INTO risks (project_id, title, description, probability, impact, level, strategy, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', r));

  // Create milestones
  const milestones = [
    [1, 'M1：入学材料就绪', '2026-06-14', 'pending', '所有Must Have材料100%备齐，无遗漏项'],
    [1, 'M2：学术方向确立', '2026-06-28', 'pending', '研究方向文档已获导师确认，科研工具链可日常使用'],
    [1, 'M3：知识体系沉淀', '2026-07-12', 'pending', '3本文献阅读完成，科研工具链全面掌握'],
    [1, 'M4：项目完整交付', '2026-07-26', 'pending', '全部交付物产出，项目复盘完成'],
  ];
  milestones.forEach(m => run('INSERT INTO milestones (project_id, name, due_date, status, criteria) VALUES (?, ?, ?, ?, ?)', m));

  console.log('Seed data inserted successfully!');
}

seed().catch(console.error);
