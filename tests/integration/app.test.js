const request = require('supertest');
const app = require('../../src/app');

describe('Student-Course API integration', () => {
  beforeEach(() => {
    require('../../src/services/storage').reset();
    require('../../src/services/storage').seed();
  });

  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe('Alice');
  });

  test('GET /students/:id should return a student', async () => {
    const res = await request(app).get('/students/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('student');
    expect(res.body.student).toHaveProperty('name');
  });

  test('GET /students/:id should return 404 for unknown student', async () => {
    const res = await request(app).get('/students/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /students should create a new student', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'David', email: 'david@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('David');
  });

  test('POST /students should not allow duplicate email', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'Eve', email: 'alice@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email must be unique');
  });

  test('DELETE /courses/:id should delete a course even if students are enrolled', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /students/:id should update student name and email', async () => {
    const res = await request(app)
      .put('/students/1')
      .send({ name: 'Alice Updated', email: 'alice.updated@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Alice Updated');
    expect(res.body.email).toBe('alice.updated@example.com');
  });

  test('GET /courses/:id should return course and enrolled students', async () => {
    const courseId = 1;
    const res = await request(app).get(`/courses/${courseId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('course');
    expect(res.body.course).toHaveProperty('id', courseId);
    expect(res.body).toHaveProperty('students');
    expect(Array.isArray(res.body.students)).toBe(true);
  });

  test('GET /courses/:id should return 404 for unknown course', async () => {
    const res = await request(app).get('/courses/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Course not found');
  });

  test('POST /courses should create a new course', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ title: 'Philosophie', teacher: 'Socrate' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('title', 'Philosophie');
    expect(res.body).toHaveProperty('teacher', 'Socrate');
    expect(res.body).toHaveProperty('id');
  });

  test('POST /courses should fail if title or teacher is missing', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ teacher: 'Anonyme' }); 

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'title and teacher required');
  });

  test('DELETE /courses/:id should delete an existing course', async () => {

    const createRes = await request(app)
      .post('/courses')
      .send({ title: 'Temporaire', teacher: 'Prof X' });

    const courseId = createRes.body.id;

    const deleteRes = await request(app).delete(`/courses/${courseId}`);
    expect(deleteRes.statusCode).toBe(204);

    const getRes = await request(app).get(`/courses/${courseId}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('DELETE /courses/:id should return 404 for unknown course', async () => {
    const res = await request(app).delete('/courses/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Course not found');
  });

  test('DELETE /courses/:id should fail if course has enrolled students', async () => {

    const courseRes = await request(app)
      .post('/courses')
      .send({ title: 'Bloqué', teacher: 'Prof Y' });
    const studentRes = await request(app)
      .post('/students')
      .send({ name: 'Élève', email: 'eleve@example.com' });

    await request(app).post(
      `/courses/${courseRes.body.id}/students/${studentRes.body.id}`
    );

    const deleteRes = await request(app).delete(
      `/courses/${courseRes.body.id}`
    );
    expect(deleteRes.statusCode).toBe(400);
    expect(deleteRes.body).toHaveProperty('error');
  });

  test('PUT /courses/:id should update course title and teacher', async () => {

    const createRes = await request(app)
      .post('/courses')
      .send({ title: 'Ancien Titre', teacher: 'Prof A' });

    const courseId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/courses/${courseId}`)
      .send({ title: 'Nouveau Titre', teacher: 'Prof B' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty('title', 'Nouveau Titre');
    expect(updateRes.body).toHaveProperty('teacher', 'Prof B');
  });

  test('PUT /courses/:id should return 404 for unknown course', async () => {
    const res = await request(app)
      .put('/courses/999')
      .send({ title: 'Inexistant', teacher: 'Prof X' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Course not found');
  });

  test('PUT /courses/:id should fail if title is already used by another course', async () => {

    const courseA = await request(app)
      .post('/courses')
      .send({ title: 'Titre Unique', teacher: 'Prof A' });

    const courseB = await request(app)
      .post('/courses')
      .send({ title: 'Autre Titre', teacher: 'Prof B' });

      const res = await request(app)
      .put(`/courses/${courseB.body.id}`)
      .send({ title: 'Titre Unique' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Course title must be unique');
  });

  test('DELETE /students/:id should return 404 for unknown student', async () => {
    const res = await request(app).delete('/students/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Student not found');
  });

  test('DELETE /students/:id should fail if student cannot be removed', async () => {

    const courseRes = await request(app)
      .post('/courses')
      .send({ title: 'Math', teacher: 'Professeur X' });

    const studentRes = await request(app)
      .post('/students')
      .send({ name: 'Bloqué', email: 'bloque@example.com' });

    await request(app).post(
      `/courses/${courseRes.body.id}/students/${studentRes.body.id}`
    );

    const deleteRes = await request(app).delete(
      `/students/${studentRes.body.id}`
    );
    expect(deleteRes.statusCode).toBe(400);
    expect(deleteRes.body).toHaveProperty('error');
  });
});
