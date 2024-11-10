import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// < getRoutineM - 전체 루틴 가져오기 >
export async function getRoutineM(userId) {
  const states = ["expected", "ongoing", "completed"];
  const response = { response: [] };

  const routines = states.map((state) => {
    prisma.routineList.findMany({
      where: {
        user: { id: userId },
        states: state,
      },
      select: {
        category: true,
        title: true,
        startDate: true,
        endDate: true,
        times: true,
        completedTimes: true,
      },
    });
    const objectives = routines.map((routine) => ({
      category: routine.category,
      title: routine.title,
      startDate: routine.startDate,
      endDate: routine.endDate,
      times: routine.times,
      completedTimes: routine.completedTimes,
    }));

    response.routinelist.push({ state: state, objective: objectives });
  });

  await Promise.all(routines);

  return response;
}

// < makeRoutineM - 루틴 작성하기 >
export async function makeRoutineM(
  userId,
  title,
  category,
  startDate,
  endDate,
  times
) {
  // routineList 테이블
  const today = new Date();
  let state;

  if (today < new Date(startDate)) {
    state = "expected";
  } else if (today >= new Date(startDate) && today <= new Date(endDate)) {
    state = "ongoing";
  } else if (today > new Date(endDate)) {
    state = "completed";
  }

  const makeRoutine = await prisma.routineList.create({
    data: {
      title: title,
      category: category,
      state: state,
      startDate: startDate,
      endDate: endDate,
      time: times,
      completedTimes: 0,
      userId: userId,
    },
  });

  const routineId = makeRoutine.id;

  // routineCheck 테이블
  const generateDatesBetween = (start, end) => {
    const dateArray = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // 하루씩 증가
    }
    return dateArray;
  };

  const dates = generateDatesBetween(new Date(startDate), new Date(endDate));

  // 각 날짜에 대해 routineId와 기본 completed 상태를 설정하여 객체 배열을 생성
  const routineChecks = dates.map((date) => ({
    routineId: routineId, // 여기에 routine ID를 입력
    date,
    completed: false, // 기본값으로 미완료 상태
  }));

  // Prisma를 사용하여 여러 개의 RoutineCheck 엔트리를 한번에 생성
  const createdRoutines = await prisma.routineCheck.createMany({
    data: routineChecks,
    skipDuplicates: true, // 선택 사항: 중복 생성 방지
  });

  return makeRoutine;
}

// < deleteRoutineM - 루틴 삭제하기 >
export async function deleteRoutineM(routineId) {
  // routineList에서 deleted 상태로 변경
  const deleteRoutine = await prisma.routineList.update({
    where: { id: routineId },
    data: { state: "deleted" },
  });

  // routineCheck에서 삭제
  await prisma.routineCheck.deleteMany({
    where: {
      routineId: routineId,
    },
  });
  return deleteRoutine;
}