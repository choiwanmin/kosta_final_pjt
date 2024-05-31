package com.example.demo.members;

import java.util.Date;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/*
 * ==================================================================
 * 
 * 추가 여부 확인 필요 멤버변수
	//	// 자동부여, 참조키
	//	private Date wupdateddt;
	//	// 자동부여, 참조키
	//	private Date aprovupdateddt;
 * ==================================================================
*/

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString

public class EduWorkExperienceInfo {
	@Id
	@SequenceGenerator(name = "seq_gen", sequenceName = "seq_eweid", allocationSize = 1)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_eweid")
	private int eweid;
	
	@OneToMany
	@JoinColumn(nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Members members;
	private Date startdt;
	private Date enddt;
	private String ewenm1;
	private String ewenm2;
	private int state;
	private int type;

}