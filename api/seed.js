import { ensureTables, sql, json } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    await sql`DELETE FROM milestones`;
    await sql`DELETE FROM risks`;
    await sql`DELETE FROM standup_logs`;
    await sql`DELETE FROM tasks`;
    await sql`DELETE FROM user_stories`;
    await sql`DELETE FROM sprints`;
    await sql`DELETE FROM projects`;

    await sql`INSERT INTO projects (id, name, start_date, end_date) VALUES (1, '研途启航 - 2026级研究生入学准备全流程管理项目', '2026-06-01', '2026-07-26')`;

    const sprints = [
      [1, 1, 1, 'Sprint 1：入学筹备冲刺', '2026-06-01', '2026-06-14', '完成所有入学行政手续和生活准备，建立项目管理基础工具', 'planned'],
      [2, 1, 2, 'Sprint 2：学术启航冲刺', '2026-06-15', '2026-06-28', '完成导师首次沟通并初步确定研究方向，搭建科研工具链基础', 'planned'],
      [3, 1, 3, 'Sprint 3：深度积累冲刺', '2026-06-29', '2026-07-12', '完成核心文献深度阅读，掌握学术写作和数据处理工具', 'planned'],
      [4, 1, 4, 'Sprint 4：整装待发冲刺', '2026-07-13', '2026-07-26', '完成项目全面复盘，优化个人学术展示，产出标准化项目经历', 'planned'],
    ];
    for (const s of sprints) {
      await sql`INSERT INTO sprints (id, project_id, number, name, start_date, end_date, goal, status) VALUES (${s[0]}, ${s[1]}, ${s[2]}, ${s[3]}, ${s[4]}, ${s[5]}, ${s[6]}, ${s[7]})`;
    }

    const stories = [
      ['US-001', 1, '入学材料清单梳理', '一次性梳理出完整的入学所需材料清单', 'P0', 3, 1, 'todo', '清单包含证件类、档案类、照片类、费用类'],
      ['US-002', 1, '证件材料准备', '提前准备好身份证、录取通知书、户口迁移证等', 'P0', 5, 1, 'todo', '所有Must Have材料已备齐并拍照留底'],
      ['US-003', 1, '录取后续手续办理', '完成政审、档案邮寄、党团关系转接等', 'P0', 5, 1, 'todo', '政审表已盖章、档案已邮寄、党团关系已转出'],
      ['US-004', 1, '导师首次沟通', '在入学前与导师进行首次正式沟通', 'P0', 3, 2, 'todo', '产出沟通纪要'],
      ['US-005', 1, '研究方向初步确认', '与导师讨论后初步确定研究方向', 'P0', 5, 2, 'todo', '产出研究方向初步规划文档'],
      ['US-006', 1, '住宿与生活准备', '提前了解学校住宿条件并做好生活准备', 'P0', 3, 1, 'todo', '住宿确认完成，生活用品清单已备齐'],
      ['US-007', 1, '核心文献阅读（第1本）', '阅读导师推荐的第1本核心文献', 'P1', 8, 2, 'todo', '产出读书笔记≥2000字'],
      ['US-008', 1, '核心文献阅读（第2本）', '阅读第2本核心文献', 'P1', 8, 3, 'todo', '产出读书笔记含对比分析'],
      ['US-009', 1, '核心文献阅读（第3本）', '阅读第3本核心文献', 'P1', 8, 3, 'todo', '产出读书笔记含知识图谱'],
      ['US-010', 1, '学习文献管理工具', '学会使用Zotero进行文献管理', 'P1', 5, 2, 'todo', '导入10篇文献并分类'],
      ['US-011', 1, '学习笔记工具', '学会使用Obsidian搭建个人知识库', 'P1', 5, 2, 'todo', '建立3个分类模块，录入10+条笔记'],
      ['US-012', 1, '学术写作工具', '学会使用LaTeX或Word高级排版', 'P1', 5, 3, 'todo', '产出格式规范的模板文档'],
      ['US-013', 1, '数据处理工具', '学会使用Python进行基础数据处理', 'P1', 5, 3, 'todo', '完成数据集的清洗分析可视化'],
      ['US-014', 1, '学习文献检索方法', '掌握CNKI、Web of Science高级检索', 'P1', 3, 2, 'todo', '建立20+篇文献检索结果集'],
      ['US-015', 1, '学术社交网络搭建', '关注研究领域内的核心学者和团队', 'P2', 3, 4, 'todo', '关注10位核心学者，订阅3个期刊'],
      ['US-016', 1, '跨专业课程了解', '了解培养方案中的课程设置', 'P2', 3, 3, 'todo', '产出课程规划表'],
      ['US-017', 1, '同届同学社群融入', '加入同届研究生的交流群组', 'P2', 2, 1, 'todo', '加入2个群组，认识5位同学'],
      ['US-018', 1, '个人简历与学术主页优化', '更新个人简历', 'P2', 3, 4, 'todo', '简历已更新'],
    ];
    for (const s of stories) {
      await sql`INSERT INTO user_stories (story_id, project_id, title, description, priority, story_points, sprint_id, status, acceptance_criteria) VALUES (${s[0]}, ${s[1]}, ${s[2]}, ${s[3]}, ${s[4]}, ${s[5]}, ${s[6]}, ${s[7]}, ${s[8]})`;
    }

    const tasks = [
      [1, '查阅学校官网入学通知', 'todo', 1, '2026-06-02'],
      [1, '分类整理材料清单', 'todo', 2, '2026-06-03'],
      [1, '标注各项截止时间', 'todo', 3, '2026-06-03'],
      [1, '身份证复印', 'todo', 4, '2026-06-04'],
      [1, '录取通知书保管', 'todo', 5, '2026-06-04'],
      [1, '户口迁移证办理', 'todo', 6, '2026-06-06'],
      [1, '照片拍摄', 'todo', 7, '2026-06-05'],
      [1, '政审表填写与盖章', 'todo', 8, '2026-06-08'],
      [1, '档案邮寄确认', 'todo', 9, '2026-06-09'],
      [1, '党团关系转接', 'todo', 10, '2026-06-09'],
      [1, '查询宿舍分配', 'todo', 11, '2026-06-10'],
      [1, '生活用品采购', 'todo', 12, '2026-06-12'],
      [1, '加入新生群组', 'todo', 13, '2026-06-03'],
      [1, '自我介绍', 'todo', 14, '2026-06-04'],
      [2, '撰写自我介绍邮件', 'todo', 1, '2026-06-16'],
      [2, '预约沟通时间', 'todo', 2, '2026-06-17'],
      [2, '准备问题清单', 'todo', 3, '2026-06-17'],
      [2, '执行导师沟通', 'todo', 4, '2026-06-18'],
      [2, '产出沟通纪要', 'todo', 5, '2026-06-18'],
      [2, '梳理2-3个候选方向', 'todo', 6, '2026-06-19'],
      [2, '撰写方向规划文档', 'todo', 7, '2026-06-20'],
      [2, '获取第1本书目', 'todo', 8, '2026-06-16'],
      [2, '制定阅读计划', 'todo', 9, '2026-06-16'],
      [2, '逐章阅读与笔记', 'todo', 10, '2026-06-22'],
      [2, '撰写读书报告', 'todo', 11, '2026-06-23'],
      [2, '安装Zotero', 'todo', 12, '2026-06-17'],
      [2, '学习Zotero基础操作', 'todo', 13, '2026-06-18'],
      [2, '导入文献并分类', 'todo', 14, '2026-06-20'],
      [2, '选定Obsidian/Notion', 'todo', 15, '2026-06-17'],
      [2, '搭建目录结构', 'todo', 16, '2026-06-18'],
      [2, '创建模板并录入笔记', 'todo', 17, '2026-06-20'],
      [2, '学习CNKI高级检索', 'todo', 18, '2026-06-19'],
      [2, '学习WoS检索', 'todo', 19, '2026-06-20'],
      [2, '建立检索结果集', 'todo', 20, '2026-06-21'],
    ];
    for (const t of tasks) {
      await sql`INSERT INTO tasks (sprint_id, title, status, sort_order, due_date) VALUES (${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, ${t[4]})`;
    }

    const risks = [
      [1, '导师沟通时间不确定', '导师可能因出差无法在预期时间内完成首次沟通', 4, 4, 'high', '提前2周发送沟通邀请，准备多个时间选项', 'monitoring'],
      [1, '文献阅读进度滞后', '文献难度超出预期或因其他任务占用时间', 4, 3, 'medium', '采用略读→精读两遍阅读法', 'monitoring'],
      [1, '工具学习遇到技术障碍', 'Zotero、Obsidian等工具安装使用遇到问题', 3, 3, 'medium', '收藏官方文档，准备替代工具方案', 'monitoring'],
      [1, '多任务切换导致效率下降', '同时推进多条线任务频繁切换', 3, 3, 'medium', '按主题分批处理，单次专注≥90分钟', 'monitoring'],
      [1, '生活突发事件打乱计划', '家庭事务、身体健康等突发事件', 3, 2, 'low', '每Sprint预留1天缓冲时间', 'monitoring'],
    ];
    for (const r of risks) {
      await sql`INSERT INTO risks (project_id, title, description, probability, impact, level, strategy, status) VALUES (${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}, ${r[4]}, ${r[5]}, ${r[6]}, ${r[7]})`;
    }

    const milestones = [
      [1, 'M1：入学材料就绪', '2026-06-14', 'pending', '所有Must Have材料100%备齐'],
      [1, 'M2：学术方向确立', '2026-06-28', 'pending', '研究方向文档导师已确认'],
      [1, 'M3：知识体系沉淀', '2026-07-12', 'pending', '3本文献+工具链全面掌握'],
      [1, 'M4：项目完整交付', '2026-07-26', 'pending', '全部交付物产出，简历可用'],
    ];
    for (const m of milestones) {
      await sql`INSERT INTO milestones (project_id, name, due_date, status, criteria) VALUES (${m[0]}, ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]})`;
    }

    // Reset sequences
    await sql`SELECT setval('projects_id_seq', 1)`;
    await sql`SELECT setval('sprints_id_seq', 4)`;
    await sql`SELECT setval('user_stories_id_seq', 18)`;
    await sql`SELECT setval('tasks_id_seq', 34)`;
    await sql`SELECT setval('risks_id_seq', 5)`;
    await sql`SELECT setval('milestones_id_seq', 4)`;

    json(res, { ok: true, message: 'Seed data inserted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
