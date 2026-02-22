const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data (except users)
    await pool.query('DELETE FROM teaching_materials');
    await pool.query('DELETE FROM student_projects');
    await pool.query('DELETE FROM awards');
    await pool.query('DELETE FROM consultancy');
    await pool.query('DELETE FROM ipr');
    await pool.query('DELETE FROM publications');
    await pool.query('DELETE FROM patents');
    await pool.query('DELETE FROM ip_assets');
    await pool.query('DELETE FROM funded_projects');
    await pool.query('DELETE FROM research_labs');
    await pool.query('DELETE FROM research_centers');
    await pool.query('DELETE FROM faculty WHERE id > 0');
    console.log('✓ Cleared existing data');

    // Insert sample faculty
    const facultyResult = await pool.query(`
      INSERT INTO faculty (name, designation, department, specialization, email, created_by)
      VALUES 
        ('Dr. Rajesh Kumar', 'Professor', 'Computer Science', 'Machine Learning, AI', 'rajesh.kumar@vnrvjiet.ac.in', 1),
        ('Dr. Priya Sharma', 'Associate Professor', 'Electronics', 'VLSI Design, IoT', 'priya.sharma@vnrvjiet.ac.in', 1),
        ('Dr. Amit Patel', 'Assistant Professor', 'Mechanical', 'Robotics, Automation', 'amit.patel@vnrvjiet.ac.in', 1),
        ('Dr. Sneha Reddy', 'Professor', 'Civil', 'Structural Engineering', 'sneha.reddy@vnrvjiet.ac.in', 1)
      RETURNING id
    `);
    console.log('✓ Inserted sample faculty');

    const facultyIds = facultyResult.rows.map(r => r.id);

    // Insert sample research centers
    await pool.query(`
      INSERT INTO research_centers (name, description, head, department, established_year, focus_areas, created_by)
      VALUES 
        ('AI & ML Research Center', 'Advanced research in artificial intelligence and machine learning', 'Dr. Rajesh Kumar', 'Computer Science', 2020, ARRAY['Machine Learning', 'Deep Learning', 'NLP'], 1),
        ('IoT Innovation Lab', 'Research and development in Internet of Things applications', 'Dr. Priya Sharma', 'Electronics', 2019, ARRAY['IoT', 'Smart Systems', 'Embedded Systems'], 1),
        ('Robotics Research Lab', 'Advanced robotics and automation research', 'Dr. Amit Patel', 'Mechanical', 2021, ARRAY['Robotics', 'Automation', 'Control Systems'], 1)
    `);
    console.log('✓ Inserted research centers');

    // Insert sample funded projects
    await pool.query(`
      INSERT INTO funded_projects (
        title, agency, agency_scientist, file_number, amount_sanctioned, 
        start_date, end_date, pi, copi, department, objectives, created_by
      )
      VALUES 
        (
          'Development of Smart City Solutions using IoT',
          'Department of Science and Technology',
          'Dr. K. Venkatesh',
          'DST/2023/001',
          5000000,
          '2023-01-01',
          '2025-12-31',
          'Dr. Priya Sharma',
          'Dr. Rajesh Kumar',
          'Electronics',
          'To develop innovative IoT-based solutions for smart city infrastructure',
          1
        ),
        (
          'AI-Powered Healthcare Diagnosis System',
          'ICMR',
          'Dr. M. Srinivas',
          'ICMR/2023/AI-001',
          3500000,
          '2023-06-01',
          '2025-05-31',
          'Dr. Rajesh Kumar',
          NULL,
          'Computer Science',
          'Development of AI algorithms for early disease detection',
          1
        ),
        (
          'Autonomous Robotic Systems for Manufacturing',
          'DRDO',
          'Dr. P. Krishnan',
          'DRDO/2024/ROB-001',
          7500000,
          '2024-01-01',
          '2026-12-31',
          'Dr. Amit Patel',
          NULL,
          'Mechanical',
          'Design and development of autonomous robotic systems for industrial applications',
          1
        )
    `);
    console.log('✓ Inserted funded projects');

    // Insert sample publications
    await pool.query(`
      INSERT INTO publications (
        title, journal_name, publication_type, year, indexing, 
        national_international, faculty_id, department, created_by
      )
      VALUES 
        (
          'Deep Learning Approaches for Medical Image Analysis',
          'IEEE Transactions on Medical Imaging',
          'journal',
          2024,
          'SCI',
          'international',
          $1,
          'Computer Science',
          1
        ),
        (
          'IoT-Based Smart Agriculture Monitoring System',
          'Journal of Agricultural Engineering',
          'journal',
          2023,
          'Scopus',
          'international',
          $2,
          'Electronics',
          1
        ),
        (
          'Advances in Autonomous Mobile Robotics',
          'International Conference on Robotics and Automation',
          'conference',
          2024,
          'Scopus',
          'international',
          $3,
          'Mechanical',
          1
        )
    `, [facultyIds[0], facultyIds[1], facultyIds[2]]);
    console.log('✓ Inserted publications');

    // Insert sample IPR
    await pool.query(`
      INSERT INTO ipr (
        title, ipr_type, application_number, status, filing_date, 
        inventors, faculty_id, department, description, created_by
      )
      VALUES 
        (
          'AI-Based Disease Detection System',
          'patent',
          'IN202341001234',
          'published',
          '2023-03-15',
          'Dr. Rajesh Kumar, Dr. Priya Sharma',
          $1,
          'Computer Science',
          'Novel AI algorithm for early detection of diseases using medical imaging',
          1
        ),
        (
          'Smart Irrigation Control System',
          'patent',
          'IN202341005678',
          'filed',
          '2023-08-20',
          'Dr. Priya Sharma',
          $2,
          'Electronics',
          'IoT-based automated irrigation system with soil moisture monitoring',
          1
        ),
        (
          'VNRVJIET Logo',
          'trademark',
          'TM/2020/001234',
          'granted',
          '2020-05-10',
          'Institution',
          NULL,
          'Administration',
          'Official logo trademark for the institution',
          1
        )
    `, [facultyIds[0], facultyIds[1]]);
    console.log('✓ Inserted IPR records');

    // Insert sample consultancy
    await pool.query(`
      INSERT INTO consultancy (
        title, client, faculty_id, department, amount_earned, 
        start_date, end_date, status, description, created_by
      )
      VALUES 
        (
          'AI Implementation Consulting',
          'Tech Solutions Pvt Ltd',
          $1,
          'Computer Science',
          500000,
          '2023-09-01',
          '2024-02-28',
          'completed',
          'Consulting on AI/ML implementation for business analytics',
          1
        ),
        (
          'IoT System Design and Implementation',
          'Smart Home Industries',
          $2,
          'Electronics',
          350000,
          '2024-01-15',
          '2024-06-30',
          'ongoing',
          'Design and implementation of IoT-based home automation system',
          1
        )
    `, [facultyIds[0], facultyIds[1]]);
    console.log('✓ Inserted consultancy records');

    // Insert sample student projects
    await pool.query(`
      INSERT INTO student_projects (
        title, project_type, students, guide_id, department, year, abstract, created_by
      )
      VALUES 
        (
          'Blockchain-Based Voting System',
          'UG',
          'Rahul Verma, Priya Singh, Amit Kumar, Sneha Patel',
          $1,
          'Computer Science',
          2024,
          'A secure and transparent voting system using blockchain technology to ensure data integrity and prevent tampering',
          1
        ),
        (
          'Smart Waste Management System using IoT',
          'UG',
          'Kiran Reddy, Lakshmi Devi, Mohan Rao',
          $2,
          'Electronics',
          2024,
          'IoT-based system for monitoring waste levels in bins and optimizing collection routes',
          1
        ),
        (
          'Design and Fabrication of Industrial Robotic Arm',
          'PG',
          'Vijay Kumar, Sanjay Sharma',
          $3,
          'Mechanical',
          2024,
          'Design, simulation, and fabrication of a 6-DOF robotic arm for industrial pick-and-place operations',
          1
        )
    `, [facultyIds[0], facultyIds[1], facultyIds[2]]);
    console.log('✓ Inserted student projects');

    // Insert sample awards
    await pool.query(`
      INSERT INTO awards (
        title, recipient_type, recipient_name, faculty_id, award_type, 
        awarding_body, year, description, created_by
      )
      VALUES 
        (
          'Best Research Paper Award',
          'faculty',
          'Dr. Rajesh Kumar',
          $1,
          'Research Excellence',
          'IEEE',
          2024,
          'Best paper award at IEEE International Conference on AI and ML',
          1
        ),
        (
          'Young Innovator Award',
          'faculty',
          'Dr. Priya Sharma',
          $2,
          'Innovation',
          'Department of Science and Technology',
          2023,
          'Recognition for innovative IoT-based solutions in agriculture',
          1
        ),
        (
          'Best Department Award',
          'department',
          'Computer Science Department',
          NULL,
          'Excellence',
          'University',
          2023,
          'Outstanding performance in research and academics',
          1
        )
    `, [facultyIds[0], facultyIds[1]]);
    console.log('✓ Inserted awards');

    // Insert sample teaching materials
    await pool.query(`
      INSERT INTO teaching_materials (
        title, description, material_type, faculty_id, course_name, department, created_by
      )
      VALUES 
        (
          'Introduction to Machine Learning',
          'Comprehensive lecture notes covering ML fundamentals',
          'pdf',
          $1,
          'Machine Learning',
          'Computer Science',
          1
        ),
        (
          'VLSI Design Fundamentals',
          'PPT slides on VLSI design principles and techniques',
          'ppt',
          $2,
          'VLSI Design',
          'Electronics',
          1
        )
    `, [facultyIds[0], facultyIds[1]]);
    console.log('✓ Inserted teaching materials');

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log('- Faculty: 4 records');
    console.log('- Research Centers: 3 records');
    console.log('- Funded Projects: 3 records');
    console.log('- Publications: 3 records');
    console.log('- IPR: 3 records');
    console.log('- Consultancy: 2 records');
    console.log('- Student Projects: 3 records');
    console.log('- Awards: 3 records');
    console.log('- Teaching Materials: 2 records');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✓ Seeding complete. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
